# WORKFLOW.md — Quy trình làm việc

## 1. Vòng đời một task

```
1. Đọc task
2. Tra Portal (PORTAL-REFERENCE.md)
3. Kiểm tra API có chưa
4. Implement
5. Self-review
6. Verify (tsc + lint + chạy thật)
7. Cập nhật tài liệu
8. Báo cáo bằng chứng
```

## 2. Bước 2 — Tra Portal (bắt buộc, không bỏ)

Trước khi viết UI cho màn hình X:

```bash
# 1. Tìm component gốc
ls /data/portal/diepxuan/laravel-catalog/src/Http/Livewire/<Module>/<Kind>/

# 2. Đọc component — lấy field, SP, tham số
cat .../<Slug>.php

# 3. Đọc view — lấy label tiếng Việt, thứ tự, format
cat /data/portal/diepxuan/laravel-catalog/resources/views/<module>/<kind>/<slug>.blade.php

# 4. Tra SP trong simba-docs khi cần chi tiết tham số
grep -rn "<SPName>" /data/portal/simba-docs/data/sysDAOInfo.md
```

Ghi ra nháp: danh sách field, label, SP, tham số, quy tắc lọc, format số.

## 3. Bước 3 — Kiểm tra API

Mở `docs/API-CONTRACT.md`. Nếu endpoint chưa có:

1. Ghi vào `MEMORY.md` mục Backlog (endpoint + màn hình + component gốc)
2. Báo Sếp
3. **Dừng** — không tự tạo API, không hardcode dữ liệu giả rồi báo xong

## 4. Bước 4 — Implement

Quy tắc:

- Route mới → file trong `src/app/`, khai báo trong `_layout.tsx` nếu cần
- Component dùng chung → `src/components/`
- Gọi API → `src/api/` (khi có client)
- Màu/cỡ chữ → `src/tokens/`, không hardcode
- Tiếng Việt cho mọi text hiển thị

## 5. Bước 6 — Verify (không được bỏ)

```bash
npx tsc --noEmit     # phải 0 lỗi
npx expo lint        # phải sạch (warning chấp nhận được nếu có lý do)
npx expo start       # chạy thật, mở web (w) hoặc Expo Go
```

Bằng chứng phải nêu rõ:
- Đã chạy trên nền tảng nào (web / Expo Go / thiết bị)
- Typecheck: pass/fail
- Lint: pass/fail (số warning nếu có)

## 6. Git flow

```bash
git checkout -b feat/<mo-ta-ngan>
# ... code ...
git add -A
git commit -m "feat: mô tả ngắn"
git push -u origin feat/<mo-ta-ngan>   # chỉ khi Sếp nói "push đi"
gh pr create --fill                     # chỉ khi Sếp nói "tạo PR đi"
```

Quy tắc:
- 1 task = 1 branch = 1 PR
- Không commit thẳng `main`
- Không tự push / tạo PR / merge
- Merge: `gh pr merge <N> --squash --delete-branch` → verify `state == MERGED`

## 7. Commit message

```
feat: thêm màn hình danh mục khách hàng
fix: sửa format số tiền âm
docs: cập nhật API contract
chore: nâng expo-router
```

## 8. Định nghĩa "XONG"

| Mức | Nghĩa | Chấp nhận |
|---|---|---|
| Chạy được | screen render, không crash | ❌ |
| Dùng được | typecheck + lint pass, loading/error/empty state, chạy thật | ✅ tối thiểu |
| Hoàn thiện | khớp hành vi Portal, có test, tài liệu cập nhật | ✅ mục tiêu |

## 9. Khi bị chặn

| Tình huống | Hành động |
|---|---|
| API chưa có | Ghi backlog, báo Sếp, dừng |
| Thiếu tên field/label | Tra `simba-docs`/component gốc; vẫn thiếu → hỏi Sếp |
| Lỗi build native | Báo Sếp (cần EAS / Apple account) |
| Không có device để test | Dùng web export + Expo Go, báo rõ giới hạn |
| Lỗi lạ sau 2-3 lần thử | Dừng, đọc lại code từ đầu, không đoán mò |
