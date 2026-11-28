# portal-app — Long-term Memory

Memory dài hạn cho Bột trên dự án `portal-app`. Ghi lại quyết định, bài học, trạng thái thật.
Đọc trước mọi task lớn để không lặp lại lỗi cũ.

Cập nhật lần cuối: 2026-11-28 — merge PR #3 (tầng auth), bypass Cloudflare, tách base URL theo môi trường.

---

## 0. Quy tắc cố định

- **Luôn tiếng Việt.** Chat, báo cáo, commit message, mô tả PR, tài liệu, comment code, text trong app — không cần Sếp nhắc lại. Chi tiết: `AGENTS.md` §0.1.
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
- Bộ tài liệu 8 file + `docs/` (ARCHITECTURE, PORTAL-REFERENCE, API-CONTRACT, DESIGN-TOKENS, WORKFLOW, EXPO-OFFICIAL-RULES).
- Đã xoá code demo của template (explore/tabs/themed-*) và ảnh demo; `src/app/` chỉ còn `_layout.tsx` + `index.tsx` khung.
- `src/api/`, `src/tokens/`, `src/components/`, `src/constants/`, `src/hooks/` đang có `.gitkeep` — tạo file thật khi làm task.
- `eslint.config.js` do `npx expo lint` sinh (eslint 9 + eslint-config-expo 58).
- `app.json` giữ `web.output: "server"` → export web cần `npx expo serve dist`. Nếu sau này host tĩnh (GitHub Pages) phải đổi sang `"single"`.
- Verify lần đầu: `tsc --noEmit` 0 lỗi, `expo lint` pass, `expo-doctor` 20/20, `expo export --platform web` OK, `expo serve dist` trả HTML 200.
- Commit đầu: `98ec9c9` (remote `main`).

---

## 2. Trạng thái API Portal (kiểm chứng 2026-11-28, sau bypass Cloudflare)

### 2.1. Hạ tầng — đã thông

Sếp đã Bypass `/api/v1` trên Cloudflare Access cho **cả hai** domain:

| Domain | Môi trường | `/api/v1` | `/` (web) |
|---|---|---|---|
| `portaldev.diepxuan.io.vn` | dev | ✅ 404/401 (vào Laravel) | 🔒 302 Access login |
| `portal.diepxuan.io.vn` | production | ✅ 404/401 (vào Laravel) | 🔒 302 Access login |

Bằng chứng: `GET /api/v1/SoPh3` → **401** `Unauthenticated.` với `server: cloudflare`
và `cf-ray` có mặt. Response 404 có trace `/var/www/html/vendor/laravel/...` —
đường dẫn container Portal thật, không phải Cloudflare trả về.

### 2.2. Endpoint

| Endpoint | Trạng thái |
|---|---|
| `GET /api/user` | ✅ có (ngoài prefix v1, vẫn bị Access chặn) |
| `GET /api/v1/SoPh3` | ⚠️ 401 — route có, cần token; logic vẫn hỏng |
| `/api/v1/products`, `/categories` | ❌ 501 chưa implement |
| **`POST /api/v1/auth/login`** | ❌ **404 — BLOCKER CHÍNH** |
| **`POST /api/v1/auth/logout`** | ❌ 404 |
| **`GET /api/v1/auth/me`** | ❌ 404 |

### 2.3. Đã chốt

| Quyết định | Nội dung |
|---|---|
| Base URL | `.env.development` = dev, `.env.production` = production (commit cả 2) |
| Fallback code | trỏ **production**, KHÔNG trỏ `portal.diepxuan.corp` (LAN) |
| Context công ty/năm | app lưu local, gửi header `X-Company-Id` + `X-Year`, web session KHÔNG đổi |
| EAS env | biến đã set cho development/preview/production |
| Expo account | `caothu159` (User) — KHÔNG dùng token robot `claw` cho Expo Go |

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

### 5.0. Không biến trí nhớ thành validate cứng (2026-11-28)

Ba lần liên tiếp trong một ngày, em tự đặt giả định rồi viết validate theo nó, và cả
ba lần đều chặn đúng thứ hợp lệ:

| Giả định sai | Sự thật | Nguồn đúng |
|---|---|---|
| Token Expo phải bắt đầu bằng `expo-` | base64url 40 ký tự, không prefix | `@expo/cli` không hề validate prefix |
| `user_type` của tài khoản người là `user` | là `person` | `/v2/auth/userinfo` |
| `expo whoami` in đúng loại tài khoản | chỉ in tên; robot và người trùng dạng | GraphQL `meActor.__typename` |

**Quy tắc:** khi cần validate, phải kiểm chứng bằng API/source thật trước, không suy
từ kinh nghiệm. Với danh tính thì kiểm `__typename`/`user_type`, không tin tên hiển thị.

### 5.0b. `.bashrc` vô dụng với shell non-interactive

Môi trường này chạy `bash -c` (`$-` = `hBc`, không có `i`), nên `~/.bashrc` KHÔNG được
nạp. Ghi `export EXPO_TOKEN=...` vào `.bashrc` không có tác dụng. Đã kiểm chứng thực
nghiệm: ghi biến vào `.bashrc` rồi gọi shell mới → biến không xuất hiện.
→ Lưu token vào file (`~/.expo/token`) và đọc bằng `$(cat ...)` mỗi lệnh.

### 5.0c. `expo-secure-store` crash trên web

Web export của package là object rỗng:
```js
// node_modules/expo-secure-store/build/ExpoSecureStore.web.js
export default {};
```
Nên `setItemAsync` gọi hàm không tồn tại → crash. Phải rẽ nhánh `Platform.OS === 'web'`
và dùng `localStorage` (xem `src/api/tokenStorage.ts`).

### 5.0d. Tunnel dùng scheme `exps://`, không phải `exp://`

`MetroBundlerDevServer.js:1012` chọn scheme theo protocol: tunnel là HTTPS nên dùng
`exps`. Comment trong source: *"Expo Go maps the `exps` scheme to HTTPS, which `exp`
can't express."* Đưa `exp://` cho user sẽ không kết nối được.

### 5.0e. Expo Go trên iPhone cần cùng account NGƯỜI với CLI

Lỗi thật đã gặp trong log Metro:
```
iOS ERROR You're signed in to Expo CLI as "claw (robot)" and to Expo Go as
          "caothu159" — these accounts need to match to open this project.
```
Expo CLI **không cảnh báo** trong terminal; lỗi chỉ hiện trên máy. Token robot qua được
`expo whoami` nhưng không dùng được cho Expo Go.

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
