/**
 * Color token — port từ /data/portal/docs/DESIGN.md (nguồn sự thật duy nhất).
 *
 * Mỗi giá trị dưới đây đều trích từ bảng Colors trong DESIGN.md, kèm tên
 * Tailwind tương ứng để đối chiếu. KHÔNG tự thêm màu mới ở đây: nếu cần màu
 * chưa có, phải hỏi Sếp và bổ sung vào DESIGN.md trước.
 */
export const colors = {
  /** blue-600 — action chính (Thêm, Lưu, Submit), link quan trọng, focus ring */
  primary: '#2563EB',
  /** blue-700 — hover/active của primary */
  primaryHover: '#1D4ED8',
  /** sky-500 — row hover, nhấn nhẹ, breadcrumb */
  tertiary: '#0EA5E9',
  /** gray-50 — nền trang mặc định */
  neutral: '#F9FAFB',
  /** white — bề mặt card / table / form */
  surface: '#FFFFFF',
  /** gray-800 — text chính */
  onSurface: '#1F2937',
  /** gray-500 — text phụ, metadata, label placeholder */
  secondary: '#6B7280',
  /** gray-200 — viền card, input, divider */
  border: '#E5E7EB',
  /** red-600 — thông báo lỗi, hành động destructive */
  error: '#DC2626',
  /** green-600 — badge hoàn thành */
  success: '#16A34A',
  /** yellow-600 — cảnh báo validation */
  warning: '#CA8A04',
  /** indigo-600 — banner success của hệ thống */
  info: '#4F46E5',
  /** red-700 — banner danger theo quy ước components/banner.blade.php */
  errorBanner: '#B91C1C',
} as const;

export type ColorToken = keyof typeof colors;
