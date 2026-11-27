# portal-app — Long-term Memory

Memory dài hạn cho Bột trên dự án `portal-app`. Ghi lại quyết định, bài học, trạng thái thật.
Đọc trước mọi task lớn để không lặp lại lỗi cũ.

Cập nhật lần cuối: khởi tạo repo + bộ tài liệu.

---

## 0. Quy tắc cố định

- **App không chứa nghiệp vụ.** Mọi tên bảng/SP/field/label lấy từ Portal (`/data/portal/`). Xem `docs/PORTAL-REFERENCE.md`.
- **Không tự tạo API.** Endpoint là việc của repo Portal; app chỉ gọi.
- **Dùng `npx expo install`**, không `npm install` cho package mới.
- **Không commit `/ios`, `/android`** (CNG).
- **Không tin trí nhớ về Expo API** — tra docs version tương ứng.
- Typecheck + lint phải pass trước khi báo xong.

---

## 1. Nhật ký

### Khởi tạo repo (session đầu)

- Sếp chốt **phương án B**: repo riêng `/data/portal-app/` thay vì nhúng vào Portal.
  - Lý do đã phân tích: Laravel đã chiếm `app/`, `package.json`, `node_modules`, `public/`; thêm nữa Docker build context và CI của Portal sẽ bị ảnh hưởng.
- Dựng bằng `create-expo-app@latest --template default` → Expo SDK **58.1.0**, RN 0.88.1, React 19.3.0, Expo Router 58.0.33, TypeScript 6.0.3.
- Template default đã có sẵn `expo-router` + `react-dom` + `react-native-web` → web chạy ngay, không cần cài thêm.
- Cấu trúc: `src/app/` (routes), `src/components/`, `src/hooks/`, `src/constants/` (SDK 55+ dùng `src/`).
- Giữ lịch sử remote `diepxuan/portal-app` (clone → thêm code, không force push).
- Bộ tài liệu 8 file + `docs/` (ARCHITECTURE, PORTAL-REFERENCE, API-CONTRACT, DESIGN-TOKENS, WORKFLOW).

---

## 2. Trạng thái API Portal (đã kiểm chứng 2026-11-27)

| Endpoint | Trạng thái |
|---|---|
| `GET /api/user` | hoạt động |
| `/api/v1/products` | 501 not implemented |
| `/api/v1/categories` | 501 not implemented |
| `/api/v1/SoPh3` | hỏng (thiếu `use SoPh3`, `$pMa_CT` không tồn tại) |
| `auth/login`, `auth/logout`, `auth/me` | **chưa có** |

→ **Blocker:** app chưa lấy được token, chưa gọi được dữ liệu thật.

Sanctum đã cài (`personal_access_tokens`, `HasApiTokens`) nhưng `expiration = null` (token vĩnh viễn — cần sửa).

---

## 3. Số liệu Portal (để ước lượng)

| Hạng mục | Số lượng |
|---|---|
| Route anchor | 302 |
| Livewire component | 156 (117 gọi SP thật, 39 shell) |
| LOC Livewire PHP | 21.294 |
| LOC Blade | 13.323 |
| SP wrapper | 2.052 |
| SModel | 443 |

→ Ưu tiên port **117 component nghiệp vụ thật**, bỏ qua shell.

---

## 4. Quyết định kiến trúc đã chốt

| Quyết định | Nội dung |
|---|---|
| Web giữ Livewire | Không chuyển web sang React — 31k LOC đang chạy tốt, rủi ro cao |
| App dùng Expo | 1 codebase cho iOS + Android + Web |
| Repo riêng | `portal-app` tách khỏi `portal` |
| Build iOS | Qua EAS Cloud (máy dev Linux, không Xcode) |
| Auth | Sanctum Bearer token (không dùng session cookie) |
| Context | Header `X-Company-Id` / `X-Year` thay cho session |

---

## 5. Bài học

### 5.1 Expo web không tự bật

Template `blank-typescript` **không** có `react-dom` / `react-native-web` → `expo export --platform web` fail.
Template `default` (dùng trong repo này) đã có sẵn. Nếu gặp lỗi "trying to use web support", cài:
`npx expo install react-dom react-native-web`.

### 5.2 Ghi file đã tồn tại phải đọc trước

Tool write yêu cầu đọc file trong cùng turn trước khi overwrite.

---

## 6. Backlog

### 6.1 Chờ Portal

- API auth (login/logout/me) + Sanctum expiration
- Middleware `X-Company-Id` / `X-Year`
- Sửa `SoPh3Controller` đang hỏng
- API danh mục P0 (ARDMKH, vật tư, kho, tài khoản)

### 6.2 Chờ Sếp

- Apple Developer Program ($99/năm) + App Store Connect API Key → mới build iOS thật
- Tài khoản Expo (miễn phí) để dùng EAS + Expo Go
- Chốt danh sách màn hình ưu tiên cho MVP

### 6.3 Trong repo

- `src/api/client.ts` — HTTP client + interceptors
- `src/tokens/` — port design token từ Portal
- Màn hình login + dashboard
- `eas.json` khi có tài khoản Expo

---

## Phụ lục: nguồn tài liệu tham chiếu

- Portal repo: `/data/portal/`
- Simba docs: `/data/portal/simba-docs/`
- Template Expo gốc: `AGENTS.expo-template.md` (giữ để tra cứu hướng dẫn chính thức của Expo)
