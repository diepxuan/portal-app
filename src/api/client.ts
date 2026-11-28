/**
 * HTTP client cho Portal API.
 *
 * Bám đúng docs/API-CONTRACT.md:
 * - Auth: Bearer token (Sanctum), KHÔNG dùng session cookie (§1, §5)
 * - Context: header `X-Company-Id` + `X-Year` thay cho session (§3)
 * - Lỗi: HTTP status đúng nghĩa, body { message, errors? } (§4)
 *
 * Quy ước context: app lưu công ty/năm ở local (xem src/api/context.ts) và gửi kèm
 * mọi request. Portal KHÔNG đọc session cho request API — web session giữ nguyên,
 * không bị ảnh hưởng bởi app.
 */

import { getApiContext } from './context';
import type { ApiError } from './types';

/**
 * Base URL API Portal.
 *
 * Giá trị thật nằm ở `.env.development` (domain dev) và `.env.production`
 * (domain production). Expo tự chọn file theo chế độ chạy — xem
 * https://docs.expo.dev/guides/environment-variables/
 *
 * Fallback dưới đây CHỈ để app không crash khi thiếu biến môi trường. Nó trỏ
 * domain production, KHÔNG trỏ `portal.diepxuan.corp` (LAN nội bộ) — nếu lọt
 * vào bản phát hành thì app trên máy người dùng thật sẽ không kết nối được.
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://portal.diepxuan.io.vn/api/v1';

/** Timeout mặc định cho mỗi request (ms) — tránh treo UI khi mạng chậm. */
const DEFAULT_TIMEOUT_MS = 20_000;

/** Lỗi có cấu trúc để UI phân biệt được loại thất bại. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Bearer token (Sanctum). Bỏ trống cho request chưa đăng nhập. */
  token?: string | null;
  /**
   * Ghi đè context cho riêng request này. Thường KHÔNG cần: client tự lấy
   * context hiện tại từ store. Chỉ dùng khi cần force một công ty cụ thể.
   */
  context?: { companyId: string; year: number } | null;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Gọi một endpoint. Ném ApiRequestError khi status không phải 2xx.
 *
 * Không tự ý retry: retry mù có thể làm sai lệch nghiệp vụ (tạo trùng chứng từ).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body, signal } = options;

  // Ưu tiên context truyền tay, nếu không có thì lấy từ store chung.
  const context = options.context ?? getApiContext();

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (context) {
    headers['X-Company-Id'] = context.companyId;
    headers['X-Year'] = String(context.year);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    const payload: unknown = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      const errorPayload = (payload ?? {}) as Partial<ApiError>;
      throw new ApiRequestError(
        errorPayload.message ?? `Yêu cầu thất bại (HTTP ${response.status})`,
        response.status,
        errorPayload.errors,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError('Hết thời gian chờ máy chủ. Kiểm tra kết nối mạng.', 0);
    }
    throw new ApiRequestError(
      'Không kết nối được máy chủ Portal. Kiểm tra mạng hoặc địa chỉ API.',
      0,
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
