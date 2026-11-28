/**
 * Tầng gọi API auth — đúng contract docs/API-CONTRACT.md §2.
 *
 * TRẠNG THÁI THẬT (kiểm chứng 2026-11-27 trên /data/portal):
 * - `routes/api.php` chỉ có `GET /api/user`, KHÔNG có auth/login|logout|me
 * - Fortify + Jetstream có sẵn (đăng nhập email/password + 2FA) nhưng chỉ phục vụ web
 * - Sanctum đã cài (`HasApiTokens` trong App\Models\User) nhưng `expiration = null`
 *
 * Vì vậy các hàm dưới đây CHƯA hoạt động. Chúng được viết sẵn để khi Portal
 * dựng endpoint là app chạy được ngay, không phải sửa lại tầng UI.
 */

import { apiRequest } from './client';
import type { AuthUser, LoginResponse } from './types';

/**
 * POST /auth/login
 * Body theo API-CONTRACT §2.1. `device_name` để Portal đặt tên token,
 * giúp user thu hồi đúng thiết bị khi xem danh sách token.
 */
export async function login(input: {
  email: string;
  password: string;
  deviceName: string;
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: {
      email: input.email,
      password: input.password,
      device_name: input.deviceName,
    },
  });
}

/** POST /auth/logout — thu hồi token hiện tại (API-CONTRACT §2.2). */
export async function logout(token: string): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST', token });
}

/** GET /auth/me — thông tin user + danh sách công ty (API-CONTRACT §2.3). */
export async function fetchMe(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', { token });
}
