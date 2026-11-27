# PORTAL-REFERENCE.md — Bản đồ tra cứu nghiệp vụ trong Portal

> **BẮT BUỘC đọc trước khi code bất kỳ màn hình nào.**
>
> Repo `portal-app` **KHÔNG chứa nghiệp vụ**. Toàn bộ tên bảng, stored procedure, tên field,
> nhãn tiếng Việt, quy tắc validate, default value đều nằm trong repo Portal.
> Agent chỉ được **tra** và **chép đúng** — cấm tự đặt.

---

## 1. Đường dẫn gốc

| Đường dẫn | Ghi chú |
|---|---|
| `/data/portal/` | Repo Portal (Laravel + Livewire + 14 package) |
| `/root/.openclaw/workspace/projects/portal/` | **Cùng một thư mục** với `/data/portal` (đã kiểm chứng cùng inode) — dùng đường dẫn nào cũng được |
| `/data/portal/simba-docs/` | Tài liệu SimbaERP .NET (43MB) — **mount readonly** từ repo `SimbaSql/docs` |
| `/data/portal/diepxuan/laravel-catalog/` | Package chứa gần như toàn bộ màn hình nghiệp vụ |
| `/data/portal/diepxuan/laravel-simba/` | 2.052 wrapper stored procedure + 443 SModel |

**Nếu `/data/portal` không tồn tại:** workspace Portal chưa mount. Dừng và báo Sếp — KHÔNG tự clone lại.

---

## 2. Bảng tra theo nhu cầu

| Cần biết gì | Đọc ở đâu |
|---|---|
| Tên bảng, tên cột, kiểu dữ liệu Simba | `simba-docs/data/` + `simba-docs/tables/` |
| Tên stored procedure + tham số | `simba-docs/data/sysDAOInfo.md`, `simba-docs/procedures/<module>/procedures.md` |
| Stored procedure wrapper đang dùng thật | `diepxuan/laravel-simba/src/StoredProcedures/` |
| Nhãn tiếng Việt của field | `simba-docs/decompiled/**/frm*.cs` (grep `lbl*.Text`) |
| Hành vi UI chuẩn (form, filter, bảng) | `diepxuan/laravel-catalog/src/Http/Livewire/**` + view tương ứng |
| Route / URL của màn hình | `docs/ROUTES-NOT-CONNECTED.md`, `diepxuan/laravel-catalog/routes/web.php` |
| Màn hình nào đã xong thật, màn nào còn shell | `docs/project/task-execution-coverage.md` |
| Quy ước nghiệp vụ bắt buộc (`ksd`, ARDMKH...) | `docs/PROJECT_CONVENTIONS.md` |
| Design token (màu, chữ, khoảng cách) | `docs/DESIGN.md` |
| Cách suy nghĩ / cách verify | `docs/AGENT-THINKING-PROTOCOL.md` |
| Task doc chi tiết từng màn hình | `docs/tasks/` |
| API hiện có | `diepxuan/laravel-catalog/routes/api.php` + `src/Http/Api/` |

---

## 3. Quy tắc bắt buộc

### 3.1. Cấm tự đặt tên

Trước khi viết bất kỳ field/label/giá trị nào, phải trả lời được: **"Cái này lấy từ đâu?"**

| Hạng | Nguồn | Độ tin cậy |
|---|---|---|
| 1 | Lỗi runtime từ SP/DB | tuyệt đối |
| 2 | `INFORMATION_SCHEMA.PARAMETERS` | tuyệt đối |
| 3 | Dữ liệu thật trong bảng | tuyệt đối |
| 4 | Form decompiled `.cs` | cao |
| 5 | `sysReportInfo` / `sysReportResx` | cao |
| 6 | `procedures.md` | trung bình (có thể lỗi thời) |
| 7 | Wrapper PHP hiện có | **thấp** — thường sai |
| ❌ | Trí nhớ agent / suy đoán | **cấm** |

Chi tiết: `/data/portal/docs/AGENT-THINKING-PROTOCOL.md` §1.

### 3.2. Quy ước `ksd` — hay bị hiểu ngược

```
ksd = 1  →  KHÔNG sử dụng / KHÓA sử dụng (disabled)
ksd = 0  →  ĐANG sử dụng (active)
```

Lọc active: `ksd = 0`. Checkbox `KSD` checked = khóa.
Nguồn: `/data/portal/docs/PROJECT_CONVENTIONS.md`.

### 3.3. App phải khớp hành vi Portal, không "cải tiến"

Mỗi màn hình app tương ứng một Livewire component. Trước khi dựng:

1. Mở component: `diepxuan/laravel-catalog/src/Http/Livewire/<Module>/<Kind>/<Slug>.php`
2. Mở view: `diepxuan/laravel-catalog/resources/views/<module>/<kind>/<slug>.blade.php`
3. Ghi lại: các field, thứ tự, label, SP gọi, tham số, quy tắc lọc, format số
4. Dựng app theo đúng danh sách đó

### 3.4. Đối chiếu trang chuẩn (bằng chứng UI)

| Loại màn hình | URL Portal để đối chiếu |
|---|---|
| Danh mục | `http://portal.diepxuan.corp/simba/so/dict/ardmkh` |
| Phiếu / chứng từ | `http://portal.diepxuan.corp/simba/po/vch/povchpo3/create` |
| Bảng kê / báo cáo | `http://portal.diepxuan.corp/simba/so/rpt/sorptbk01` |

**KHÔNG suy URL từ `routes/web.php`** — thiếu host + prefix `/simba`.

### 3.5. Không chạm DB trực tiếp

- Máy này **không** có kết nối DB (thiết kế cố ý, không phải thiếu driver).
- Không chạy `artisan tinker`, `db:*`, `migrate*`, `sqlcmd` trên máy này.
- Làm việc với dữ liệu qua browser thật trên `http://portal.diepxuan.corp/simba`.
- Chi tiết: `/data/portal/TOOLS.md` §"Môi trường thực thi".

---

## 4. Số liệu Portal (đã đo, dùng để ước lượng)

| Hạng mục | Số lượng |
|---|---|
| Route anchor trong Portal | 302 |
| Livewire component (không tính test) | 156 |
| Component **có gọi SP** (nghiệp vụ thật) | 117 |
| Component không gọi SP (shell/metadata/UI phụ) | 39 |
| LOC Livewire PHP tổng | 21.294 |
| LOC Blade | 13.323 |
| Stored procedure wrapper | 2.052 |
| SModel | 443 |

Hệ quả cho app: **ưu tiên 117 component nghiệp vụ thật**, bỏ qua 39 shell.

---

## 5. Trạng thái API Portal (tại thời điểm tạo repo)

Đã kiểm chứng trong `/data/portal`:

| Endpoint | Trạng thái |
|---|---|
| `GET /api/user` | Hoạt động (auth:sanctum) |
| `GET/POST/PUT/DELETE /api/v1/products` | **501 not implemented** |
| `GET/POST/PUT/DELETE /api/v1/categories` | **501 not implemented** |
| `GET/POST/PUT/DELETE /api/v1/SoPh3` | **HỎNG** — thiếu `use SoPh3`, property `$pMa_CT` không tồn tại |
| `POST /api/v1/auth/login` | **CHƯA CÓ** |

Sanctum đã cài (`personal_access_tokens` migration có, `User` có `HasApiTokens`), nhưng **chưa có endpoint cấp token**.
Xem `docs/API-CONTRACT.md` để biết cần gì.

**Quan trọng:** app chưa gọi được API thật cho đến khi Portal có endpoint.
Không được tự tạo API trong repo `portal-app`.

---

## 6. Khi Portal thiếu thông tin

1. Tra thêm `simba-docs/` (nguồn sâu nhất là `decompiled/`).
2. Nếu vẫn thiếu → **báo Sếp**, nêu rõ đã tra gì, thiếu gì.
3. **Không** tự đoán rồi code — vì app sẽ hiển thị sai nghiệp vụ.
