/**
 * Auth context cho toàn app.
 *
 * Lưu token trong expo-secure-store (Keychain trên iOS, Keystore trên Android),
 * KHÔNG dùng AsyncStorage — token là bí mật, không được nằm ở plain storage.
 *
 * Trạng thái `restoring` là bắt buộc: đọc secure store là async, nếu render
 * màn login trước khi biết token còn hay mất sẽ gây nháy màn hình sai.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchMe, login as loginRequest, logout as logoutRequest } from '@/api/auth';
import { ApiRequestError } from '@/api/client';
import { setApiContext } from '@/api/context';
import { deleteItem, getItem, setItem } from '@/api/tokenStorage';
import type { AuthUser, Company } from '@/api/types';

const TOKEN_KEY = 'portal_app_token';
const COMPANY_KEY = 'portal_app_company_id';
const YEAR_KEY = 'portal_app_year';

interface AuthState {
  /** null = chưa đăng nhập */
  user: AuthUser | null;
  token: string | null;
  /** Công ty đang chọn — header X-Company-Id */
  companyId: string | null;
  /** Năm đang chọn — header X-Year */
  year: number;
  /** true khi đang đọc secure store lần đầu */
  restoring: boolean;
  /** true khi đang gọi API đăng nhập */
  signingIn: boolean;
  /** Lỗi đăng nhập gần nhất, đã là tiếng Việt */
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  selectCompany: (company: Company) => Promise<void>;
  setYear: (year: number) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Tên thiết bị gửi lên Portal để đặt tên token. */
function deviceLabel(): string {
  // expo-device không bắt buộc; dùng hằng số ổn định, đủ để user phân biệt.
  return 'portal-app-mobile';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [year, setYearState] = useState<number>(new Date().getFullYear());
  const [restoring, setRestoring] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khôi phục phiên khi mở app.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [savedToken, savedCompany, savedYear] = await Promise.all([
          getItem(TOKEN_KEY),
          getItem(COMPANY_KEY),
          getItem(YEAR_KEY),
        ]);

        if (cancelled) {
          return;
        }

        if (savedYear) {
          const parsed = Number(savedYear);
          if (Number.isFinite(parsed)) {
            setYearState(parsed);
          }
        }

        if (!savedToken) {
          return;
        }

        // Có token → xác minh còn hiệu lực bằng auth/me.
        const me = await fetchMe(savedToken);
        if (cancelled) {
          return;
        }

        setToken(savedToken);
        setUser(me);
        setCompanyId(savedCompany ?? me.companies[0]?.ma_cty ?? null);
      } catch (restoreError) {
        // Token hết hạn hoặc sai → xoá, đưa về trạng thái chưa đăng nhập.
        if (!cancelled) {
          await deleteItem(TOKEN_KEY).catch(() => undefined);
          if (restoreError instanceof ApiRequestError && restoreError.status === 401) {
            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        }
      } finally {
        if (!cancelled) {
          setRestoring(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setSigningIn(true);
    setError(null);

    try {
      const result = await loginRequest({
        email: email.trim(),
        password,
        deviceName: deviceLabel(),
      });

      await setItem(TOKEN_KEY, result.token);

      const firstCompany = result.user.companies[0]?.ma_cty ?? null;
      if (firstCompany) {
        await setItem(COMPANY_KEY, firstCompany);
      }

      setToken(result.token);
      setUser(result.user);
      setCompanyId(firstCompany);
      return true;
    } catch (signInError) {
      setError(toVietnameseMessage(signInError));
      return false;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (token) {
      // Thu hồi token phía server; lỗi mạng vẫn phải xoá local.
      await logoutRequest(token).catch(() => undefined);
    }

    await Promise.allSettled([
      deleteItem(TOKEN_KEY),
      deleteItem(COMPANY_KEY),
      deleteItem(YEAR_KEY),
    ]);

    setToken(null);
    setUser(null);
    setCompanyId(null);
    setError(null);
  }, [token]);

  const selectCompany = useCallback(async (company: Company) => {
    await setItem(COMPANY_KEY, company.ma_cty);
    setCompanyId(company.ma_cty);
  }, []);

  const setYear = useCallback(async (nextYear: number) => {
    await setItem(YEAR_KEY, String(nextYear));
    setYearState(nextYear);
  }, []);

  /**
   * Đồng bộ context (công ty + năm) xuống tầng API.
   *
   * Mọi request sau đó tự động có header X-Company-Id / X-Year mà không nơi nào
   * phải nhớ truyền tay. Thiếu bước này thì request âm thầm chạy với '001' của
   * Portal — sai dữ liệu mà không báo lỗi.
   */
  useEffect(() => {
    if (companyId) {
      setApiContext({ companyId, year });
    } else {
      setApiContext(null);
    }
  }, [companyId, year]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      companyId,
      year,
      restoring,
      signingIn,
      error,
      signIn,
      signOut,
      selectCompany,
      setYear,
      clearError,
    }),
    [
      user,
      token,
      companyId,
      year,
      restoring,
      signingIn,
      error,
      signIn,
      signOut,
      selectCompany,
      setYear,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  }
  return context;
}

/** Chuyển lỗi kỹ thuật sang câu tiếng Việt cho người dùng cuối. */
function toVietnameseMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      return 'Email hoặc mật khẩu không đúng.';
    }
    if (error.status === 423) {
      return 'Tài khoản đang bị tạm khoá. Liên hệ quản trị viên.';
    }
    if (error.status === 429) {
      return 'Bạn đã thử quá nhiều lần. Vui lòng chờ một phút rồi thử lại.';
    }
    if (error.status === 404) {
      return 'Máy chủ Portal chưa mở API đăng nhập. Vui lòng báo quản trị viên.';
    }
    if (error.status === 0) {
      return error.message;
    }
    return error.message;
  }
  return 'Đăng nhập thất bại. Vui lòng thử lại.';
}
