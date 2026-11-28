/**
 * Kiểu dữ liệu theo hợp đồng API trong docs/API-CONTRACT.md.
 *
 * Nguyên tắc: field name giữ ĐÚNG tên cột Simba (`ma_cty`, `ten_cty`...),
 * không đổi sang camelCase — để đối chiếu được với simba-docs và Livewire gốc.
 */

/** Một công ty user được phép truy cập. Nguồn: API-CONTRACT §2.3. */
export interface Company {
  /** Mã công ty — cột `ma_cty` trong Simba */
  ma_cty: string;
  /** Tên công ty — cột `ten_cty` trong Simba */
  ten_cty: string;
}

/** Thông tin user trả về từ auth/me — API-CONTRACT §2.3. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  companies: Company[];
}

/** Response của POST auth/login — API-CONTRACT §2.1. */
export interface LoginResponse {
  /** Sanctum Bearer token */
  token: string;
  /** ISO 8601 UTC, null nếu token không hết hạn */
  expires_at: string | null;
  user: AuthUser;
}

/** Lỗi chuẩn của Portal — API-CONTRACT §4. */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

/** Tham số ngữ cảnh công ty/năm — API-CONTRACT §3. */
export interface ContextHeaders {
  companyId: string;
  year: number;
}
