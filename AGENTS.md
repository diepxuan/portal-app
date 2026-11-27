# AGENTS.md - Operating Instructions (portal-app)

Operating instructions cho Bột trên dự án `portal-app`. Xem SOUL.md cho bản sắc, IDENTITY.md cho chi tiết identity.

---

## 0. Boot Sequence

Mỗi session PHẢI đọc theo đúng thứ tự trong SOUL.md §4:

1. **SOUL.md**
2. **USER.md**
3. **IDENTITY.md**
4. **TOOLS.md**
5. **docs/PORTAL-REFERENCE.md** ← bắt buộc, bản đồ tra cứu nghiệp vụ
6. `memory/<hôm-nay>.md` → 7. `memory/<hôm-qua>.md` (nếu có)
8. **MEMORY.md** (chỉ MAIN SESSION)
9. **docs/ARCHITECTURE.md**
10. **docs/API-CONTRACT.md**

Xung đột ưu tiên: chỉ dẫn mới nhất của Sếp → SOUL.md → USER.md → IDENTITY.md → AGENTS.md → tài liệu dự án.

---

## 1. Nguyên tắc gốc: app không có nghiệp vụ

**Repo này chỉ chứa giao diện.** Mọi thứ về nghiệp vụ nằm ở Portal:

- Tên bảng, cột, SP, tham số → `simba-docs/`
- Nhãn tiếng Việt, thứ tự field, validate → Livewire component gốc
- Design token → `docs/DESIGN.md`
- Quy ước (`ksd`, ARDMKH) → `docs/PROJECT_CONVENTIONS.md`

**Cấm:** tự đặt tên field, tự chế label, tự suy luận quy tắc nghiệp vụ.

Chi tiết tra cứu: `docs/PORTAL-REFERENCE.md`.

---

## 2. Expo — không tin trí nhớ

Expo phát hành breaking change mỗi SDK. Trước khi dùng API lạ:

1. Đọc version `expo` trong `package.json` (hiện `~58.1.0`)
2. Tra `https://docs.expo.dev/versions/v58.0.0/`
3. Index đầy đủ: `https://docs.expo.dev/llms.txt`

### Lệnh chuẩn

```bash
npx expo install <package>   # LUÔN dùng, không npm/yarn add — để resolve version đúng SDK
npx expo start               # dev server
npx expo start --tunnel      # khi cần test trên máy thật khác mạng
npx expo lint                # lint
npx tsc --noEmit             # typecheck
npx expo-doctor              # chẩn đoán dependency/config
npx expo install --fix       # sửa version lệch
```

Chạy lint + typecheck **trước khi báo xong**.

---

## 3. Routing

- Dùng **Expo Router** — file-based.
- Routes ở `src/app/`; mỗi file là 1 screen; `_layout.tsx` định nghĩa navigator.
- Code không phải route (component, hook, util) để **ngoài** `src/app/`.
- Import `Link`, `router`, `useLocalSearchParams` từ `expo-router`.
- Docs: `https://docs.expo.dev/router/introduction.md`

---

## 4. Build & native

- `/ios` và `/android` **không commit** — sinh tự động (Continuous Native Generation).
- Không sửa tay file native; cấu hình qua `app.json` + config plugins.
- Thêm thư viện có native code → cần dev build (`expo run:ios|android` hoặc `eas build --profile development`), Expo Go không đủ.
- Build iOS trên máy này **không được** (Linux, không Xcode) → phải dùng EAS Cloud:
  ```bash
  npx eas-cli@latest login
  npx eas-cli@latest build --platform ios --profile development
  ```
- EAS cần: tài khoản Expo + Apple Developer Program (iOS). Không tự tạo/mua — báo Sếp.

---

## 5. Code Scope

| Ưu tiên | Vị trí | Ghi chú |
|---|---|---|
| Chính | `src/app/` | screens |
| Chính | `src/components/`, `src/api/`, `src/tokens/` | UI, HTTP client, design token |
| Hạn chế | `app.json` | cấu hình app — đổi phải báo Sếp |
| Hạn chế | `package.json` | dependency — thêm qua `npx expo install` |
| Tài liệu | `docs/`, `README.md`, `MEMORY.md` | cập nhật khi cơ chế đổi |

**Cấm:** sửa bất kỳ file nào trong `/data/portal/` từ repo này. Việc backend là task riêng của agent Portal.

---

## 6. Git Discipline

- Remote: `git@github.com:diepxuan/portal-app.git`, branch chính `main`.
- Mỗi task = 1 branch = 1 PR; KHÔNG commit thẳng `main`.
- Không tự push / tạo PR / merge; chỉ khi Sếp nói "push đi" / "Em tạo PR đi".
- Merge PR: `gh pr merge <N> --squash --delete-branch`, verify state `MERGED`.
- Commit message tiếng Việt, ngắn, bắt đầu bằng loại: `feat:`, `fix:`, `docs:`, `chore:`.

---

## 7. Task Completion Cycle

1. **Đọc task** — xác định màn hình/data cần, mở `docs/PORTAL-REFERENCE.md`
2. **Tra Portal** — tìm Livewire component + view gốc; đọc SP liên quan trong `simba-docs/`
3. **Kiểm tra API** — endpoint đã có chưa? Nếu chưa → dừng, báo Sếp (xem `docs/API-CONTRACT.md` §7)
4. **Implement** — dựng screen theo đúng hành vi Portal
5. **Self-review** — UI, loading, error, empty state, safe area
6. **Verify** — `npx tsc --noEmit` + `npx expo lint` + chạy thật (`npx expo start`) trên web và/hoặc Expo Go
7. **Documentation** — cập nhật `MEMORY.md`/docs nếu cơ chế đổi
8. **Báo cáo** — bằng chứng cụ thể (số dòng, kết quả typecheck, ảnh chụp, nền tảng đã chạy)

### Guard rails

- Thiếu dữ kiện → đọc source trước; vẫn thiếu thì hỏi Sếp
- Gặp lỗi → dừng, phân tích gốc, không vá mù
- **Không báo xong khi chưa chạy thật** và chưa typecheck/lint
- Không tự tạo API, không tự sửa Portal
- Không đoán tên field/label — phải trích dẫn nguồn trong báo cáo

---

## 8. Sub-Agents

- Gọi là **đệ**
- Mô tả rõ: mục tiêu, input, output, giới hạn quyền
- Đệ không được vượt quyền Bột, không được tự push hay sửa Portal
