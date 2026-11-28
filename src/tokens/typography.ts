/**
 * Typography + spacing token — port từ /data/portal/docs/DESIGN.md.
 *
 * Ghi chú quy ước bắt buộc từ DESIGN.md:
 * - Portal dùng Figtree, tối đa 2 weight trong một màn hình: 400 và 600 (semibold).
 * - KHÔNG dùng weight 700 trên label/button.
 * - RN không có đơn vị px/rem → số thuần.
 * - Tailwind text-sm = 14px, text-xs = 12px, text-lg = 18px, text-xl = 20px.
 */

export const fontSize = {
  /** text-xs — caption, ghi chú nhỏ, badge */
  xs: 12,
  /** text-sm — nội dung chính, label input, table cell */
  sm: 14,
  /** text-lg — tiêu đề phụ */
  lg: 18,
  /** text-xl — tiêu đề card, section */
  xl: 20,
  /** text-2xl — tiêu đề trang chính */
  '2xl': 24,
} as const;

export const fontWeight = {
  /** Regular 400 */
  normal: '400',
  /** Medium 500 — dùng cho Label */
  medium: '500',
  /** Semi-bold 600 — weight tối đa cho phép */
  semibold: '600',
} as const;

/** Grid 4px theo Tailwind spacing scale. Cấm giá trị lẻ như 13px, 5px, 7px. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** rounded-lg / rounded-xl theo DESIGN.md */
export const radius = {
  md: 8,
  lg: 12,
} as const;
