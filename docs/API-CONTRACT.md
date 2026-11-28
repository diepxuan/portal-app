# API-CONTRACT.md — Hợp đồng API giữa portal-app và Portal

> Trạng thái hiện tại: **CHƯA CÓ API cho app**. Tài liệu này ghi rõ cần gì để Sếp/agent bên Portal xây.

---

## 0. Phía app đã sẵn sàng (2026-11-28)

Tầng auth của app đã code xong, chỉ chờ endpoint. Khi Portal dựng API đúng contract
dưới đây, **không cần sửa code app** — chỉ cần build lại.

| Thành phần | File | Trạng thái |
|---|---|---|
| HTTP client (Bearer + X-Company-Id + X-Year) | `src/api/client.ts` | xong |
| Auth API (login / logout / me) | `src/api/auth.ts` | xong, gọi sẽ 404 |
| Lưu token (Keychain / Keystore) | `src/api/tokenStorage.ts` | xong |
| Auth context + khôi phục phiên | `src/hooks/useAuth.tsx` | xong |
| Màn hình đăng nhập | `src/app/login.tsx` | xong |
| Design token port từ DESIGN.md | `src/tokens/` | xong |

Đã verify: `tsc --noEmit` 0 lỗi, `expo lint` sạch, export web OK, render thật trên
Chromium headless (màn login hiện đúng, chuyển hướng khi chưa đăng nhập hoạt động).

---

## 1. Trạng thái đã kiểm chứng (2026-11-27)

| Endpoint | Trạng thái | Ghi chú |
|---|---|---|
| `GET /api/user` | ✅ hoạt động | middleware `auth:sanctum` |
| `/api/v1/products` | ❌ 501 | `CatalogController` trả "not implemented" |
| `/api/v1/categories` | ❌ 501 | `CategoryController` trả "not implemented" |
| `/api/v1/SoPh3` | 💥 hỏng | thiếu `use SoPh3`; property `$pMa_CT` không tồn tại |
| `POST /api/v1/auth/login` | ❌ chưa có | Sanctum có nhưng không có endpoint cấp token |
| `POST /api/v1/auth/logout` | ❌ chưa có | |
| `GET /api/v1/auth/me` | ❌ chưa có | |

**Kết luận:** app chưa thể lấy token, chưa thể gọi dữ liệu.

---

## 2. Auth — cần Portal bổ sung

### 2.1. Đăng nhập

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@diepxuan.com",
  "password": "***",
  "device_name": "portal-app-ios"
}
```

```json
200 OK
{
  "token": "1|xxxxxxxx",
  "expires_at": "2027-02-25T00:00:00Z",
  "user": { "id": 1, "name": "...", "email": "..." }
}
```

Yêu cầu:
- Dùng `Auth::attempt` + `$user->createToken()`
- Rate limit **5 lần/phút** theo email+IP
- **Bắt buộc đặt `expiration`** cho Sanctum (hiện `null` = token vĩnh viễn — rủi ro bảo mật)
- Trả `401` khi sai, `423` khi bị lock

### 2.2. Đăng xuất

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```
→ thu hồi token hiện tại (`currentAccessToken()->delete()`)

### 2.3. Thông tin user

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```
```json
{ "id": 1, "name": "...", "email": "...", "companies": [{"ma_cty": "001", "ten_cty": "..."}] }
```

---

## 3. Context công ty / năm — bắt buộc

### 3.1. Quyết định đã chốt (2026-11-28)

| Hạng mục | Quyết định |
|---|---|
| Nơi lưu context | **App lưu local** (secure storage) — không phụ thuộc session |
| Cách truyền | Gửi kèm **mọi request** qua header `X-Company-Id` + `X-Year` |
| Web session | **KHÔNG đổi** — Portal web giữ nguyên `session('selected_company')` |
| Base URL | `…/api/v1` |

Portal hiện lấy context từ session:

```php
// diepxuan/laravel-catalog/src/Services/CatalogService.php:156
$ma_cty = session('selected_company', '001');
// :181
$year = session('year', now()->year);
```

App dùng Bearer token không có session. Nếu không có middleware, **mọi request của app
sẽ chạy với `ma_cty = '001'` và năm hiện tại** — sai dữ liệu kế toán, không báo lỗi.

### 3.2. Phía app đã làm xong

| Thành phần | File |
|---|---|
| Store context cấp module | `src/api/context.ts` |
| Tự đính header mọi request | `src/api/client.ts` |
| Đồng bộ context khi user đổi công ty/năm | `src/hooks/useAuth.tsx` |

Đã kiểm chứng bằng test chạy thật: request tự có `X-Company-Id`/`X-Year`, đổi context
thì header đổi theo, logout thì header biến mất. Không nơi gọi nào phải nhớ truyền tay.

### 3.3. Phía Portal cần làm — CHỈ ĐỌC HEADER, KHÔNG ĐỤNG SESSION

```http
GET /api/v1/ardmkh
Authorization: Bearer <token>
X-Company-Id: 001
X-Year: 2026
```

**Cách đúng:** tạo một `CatalogContext` object (hoặc bind vào container) đọc từ request
header, và cho `CatalogService` lấy từ đó **thay vì** `session()`.

**Cảnh báo kỹ thuật:** group middleware `api` của Laravel 11 **không có `StartSession`**
(kiểm chứng tại `Illuminate/Foundation/Configuration/Middleware.php:494`), và Portal
không bật `statefulApi`. Nên cách cũ "$request->session()->put(...)" **sẽ không chạy**.
Đừng thêm `StartSession` vào group `api` — điều đó biến API thành stateful, đúng thứ
contract này muốn tránh, và ảnh hưởng web session mà Sếp yêu cầu giữ nguyên.

Các file đang đọc `session()` (cần refactor nếu muốn API đọc được context):

| File | Dòng | Nội dung |
|---|---|---|
| `diepxuan/laravel-catalog/src/Services/CatalogService.php` | 156, 162, 181, 184 | `selected_company`, `year` |
| `diepxuan/laravel-catalog/src/Services/KhoaSo.php` | 184 | `selected_company` |
| `diepxuan/laravel-catalog/src/Config/TimerConfig.php` | 56-58 | `timeId`, `timeStart`, `timeEnd` |
| `diepxuan/laravel-catalog/src/Http/Livewire/Si/Vch/Smks.php` | 149 | `selected_company` |

Gợi ý: `CatalogService` là singleton (`CatalogServiceProvider.php:42`), nên có thể inject
context qua setter trước khi controller chạy, không cần sửa mọi chỗ gọi `catalog()`.

**Bắt buộc validate:** `X-Company-Id` phải nằm trong danh sách công ty của user. Nếu
không, user chỉ cần sửa header là đọc được dữ liệu công ty khác — lỗ hổng phân quyền,
không chỉ là validate dữ liệu.

Quy tắc khi thiếu header:
- `X-Company-Id` → công ty đầu tiên user được quyền (hoặc `'001'` như hiện tại)
- `X-Year` → năm hiện tại

---

## 4. Response convention

```json
// Danh sách
{ "data": [ {...} ], "meta": { "total": 26, "page": 1, "per_page": 50 } }

// Một bản ghi
{ "data": { ... } }

// Lỗi
{ "message": "Mô tả tiếng Việt", "errors": { "field": ["..."] } }
```

Quy ước:
- HTTP status đúng nghĩa (200/201/401/403/404/422/429/500)
- Timestamp ISO 8601 UTC
- Số tiền: `string` để tránh mất precision (Simba dùng decimal 18,4)
- Field name: **giữ đúng tên cột Simba** (`ma_cty`, `ma_kh`, `ten_kh`, `ksd`) — không đổi sang camelCase, để đối chiếu với `simba-docs` và Livewire gốc

---

## 5. Rate limit & bảo mật

| Nhóm | Giới hạn đề xuất |
|---|---|
| `auth/login` | 5 / phút / email+IP |
| API đọc (`GET`) | 60 / phút / token |
| API ghi (`POST/PUT/DELETE`) | 30 / phút / token |

Bắt buộc:
- Token hết hạn (30–90 ngày) + cơ chế refresh
- Revoke token khi logout / đổi mật khẩu
- Log ai gọi endpoint gì (audit)
- HTTPS bắt buộc (không cho HTTP thường)

---

## 6. Endpoint cần cho app — theo mức ưu tiên

| Ưu tiên | Nhóm | Endpoint | Nguồn nghiệp vụ |
|---|---|---|---|
| P0 | Auth | `login`, `logout`, `me` | Fortify + Sanctum |
| P0 | Danh mục | `GET /ardmkh`, `GET /ardmkh/{ma_kh}` | `So\Dict\Ardmkh` |
| P0 | Danh mục | `GET /vattu`, `GET /kho`, `GET /taikhoan` | `InputIndmvt`, `InputIndmkho`, `InputTaikhoan` |
| P1 | Báo cáo | `GET /congno/ar`, `GET /congno/ap` | `Arrptbccn01*` |
| P1 | Báo cáo | `GET /tonkho` | `In\Rpt\*` |
| P2 | Chứng từ | `GET /povchpo3`, `GET /povchpo3/{id}` (đọc) | `Po\Vch\Povchpo3` |
| P2 | Chứng từ | `POST /povchpo3` (ghi) — cần Sếp duyệt riêng | `Povchpo3Edit` |
| P3 | Dashboard | `GET /dashboard` | `Home\Dashboard` |

**Ghi chú:** mỗi endpoint phải có Livewire component gốc trong Portal làm chuẩn. Endpoint không có màn hình gốc = không được tạo.

---

## 7. Quy trình khi cần endpoint mới

1. Agent app xác định cần gì, ghi vào `MEMORY.md` mục Backlog
2. Báo Sếp: endpoint, payload, màn hình tương ứng, component gốc trong Portal
3. Sếp quyết định — agent Portal xây API (task riêng bên repo Portal)
4. API xong → agent app cập nhật `src/api/` + tài liệu này

**Không** agent app tự sửa `/data/portal/routes/api.php`.
