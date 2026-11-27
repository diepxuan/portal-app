# DESIGN-TOKENS.md — Đồng bộ giao diện với Portal

## 1. Nguyên tắc

App và web Portal phải **nhìn như một sản phẩm**. Nhưng không dùng chung CSS — app dùng React Native
style object. Cách đồng bộ duy nhất: **port token** từ `/data/portal/docs/DESIGN.md`.

```
Portal docs/DESIGN.md  (nguồn sự thật)
        ↓ port tay, một lần
src/tokens/*.ts        (dùng trong app)
```

## 2. Token Portal hiện có (đọc từ DESIGN.md)

Portal dùng Tailwind. Các nhóm token:

| Nhóm | Ví dụ | Ghi chú |
|---|---|---|
| Color | primary, success, danger, warning, info, surface, border | dùng class `bg-*`, `text-*` |
| Typography | scale cỡ chữ, weight | `text-sm`, `font-medium` |
| Radius | `rounded-lg`, `rounded-full` | |
| Shadow | `shadow-sm`, `shadow` | |
| Spacing | grid 4px (Tailwind scale) | |

**Trước khi dựng UI**, mở `/data/portal/docs/DESIGN.md` và lấy giá trị thật — không dùng bảng này thay thế.

## 3. Cách port

Tạo `src/tokens/` với các file:

```ts
// src/tokens/colors.ts
export const colors = {
  primary: '#...',      // lấy từ DESIGN.md
  primaryDark: '#...',
  success: '#...',
  danger: '#...',
  warning: '#...',
  info: '#...',
  surface: '#ffffff',
  background: '#f9fafb',
  border: '#e5e7eb',
  textPrimary: '#111827',
  textMuted: '#6b7280',
} as const;
```

```ts
// src/tokens/typography.ts
export const typography = {
  size: { xs: 12, sm: 13, base: 14, lg: 16, xl: 20 },
  weight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
} as const;
```

```ts
// src/tokens/spacing.ts
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
```

## 4. Khác biệt bắt buộc chấp nhận

| Web (Tailwind) | App (RN) | Ghi chú |
|---|---|---|
| `bg-blue-600` | `{ backgroundColor: colors.primary }` | |
| `text-sm` | `{ fontSize: 13 }` | Tailwind `text-sm` = 14px, RN không có rem |
| `shadow-sm` | `{ boxShadow: ... }` / elevation | Android dùng `elevation` |
| `hover:` | **không có** | Mobile không có hover — dùng `pressed` state |
| `<table>` | `<FlatList>` / `<ScrollView>` | RN không có table |
| Đơn vị `px` | số thuần | RN không cần đơn vị |

## 5. Quy tắc UI

1. **Không hardcode màu/cỡ chữ** trong component — luôn import từ `src/tokens/`.
2. **Không dùng `react-native-web` để dựng bảng 20 cột** — RN không phù hợp; bảng lớn để web Portal.
3. **Form**: theo màn hình gốc Portal — cùng thứ tự field, cùng label tiếng Việt.
4. **Số tiền**: căn phải, format theo Portal (`laravel-currency`). Đọc `diepxuan/laravel-currency/` để biết format.
5. **Tiếng Việt** là ngôn ngữ hiển thị duy nhất.
6. **Safe area**: dùng `react-native-safe-area-context` cho mọi screen.

## 6. Màn hình nào thuộc app, màn nào để web

| Loại | App | Web |
|---|---|---|
| Tra cứu danh mục | ✅ | ✅ |
| Đơn hàng / chứng từ (nhập liệu) | ✅ (form đơn giản) | ✅ |
| Báo cáo 20+ cột | ❌ | ✅ |
| In A4 | ❌ | ✅ |
| Dashboard | ✅ (mobile) | ✅ (desktop) |

Nguyên tắc: mobile lo **tra cứu nhanh + nhập liệu ngắn**. Bảng lớn, in ấn, phân tích nhiều cột → web.
