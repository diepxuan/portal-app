/**
 * Ngữ cảnh làm việc (công ty + năm) ở cấp module.
 *
 * Vì sao cần store riêng thay vì truyền tham số mỗi lần gọi:
 * - Context đổi rất ít (khi user chọn công ty/năm) nhưng phải có mặt ở MỌI request.
 * - Truyền tay từng chỗ dễ quên một chỗ → request đó âm thầm chạy với công ty mặc định
 *   '001' của Portal, tức là SAI DỮ LIỆU KẾ TOÁN mà không báo lỗi.
 *
 * Cách hoạt động: AuthProvider gọi `setApiContext()` mỗi khi context đổi; client đọc
 * `getApiContext()` để tự đính header X-Company-Id / X-Year. Không nơi gọi nào phải
 * nhớ truyền.
 */

export interface ApiContext {
  companyId: string;
  year: number;
}

let current: ApiContext | null = null;

/** Cập nhật context. Gọi từ AuthProvider khi user đổi công ty hoặc năm. */
export function setApiContext(next: ApiContext | null): void {
  current = next;
}

/** Đọc context hiện tại — client dùng để đính header. */
export function getApiContext(): ApiContext | null {
  return current;
}
