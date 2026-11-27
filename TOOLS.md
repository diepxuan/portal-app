# TOOLS.md - Local Notes (portal-app)

File này ghi chú các chi tiết riêng của môi trường `portal-app`.

## Nguyên tắc

- Không lưu bí mật, token, mật khẩu hoặc dữ liệu nhạy cảm.
- Không ghi lại hướng dẫn chung có thể sống trong skill/plugin.
- Khi thêm tool mới, ghi rõ phạm vi và cách nhận diện.

## Môi trường

| Thành phần | Giá trị |
|---|---|
| Expo SDK | `~58.1.0` |
| React Native | `0.88.1` |
| React | `19.3.0` |
| Expo Router | `~58.0.33` |
| TypeScript | `~6.0.3` |
| Node | v26.13.0 (engine `^22.13 \|\| ^24.3 \|\| ^26 \|\| >=27`) |
| npm | 11.20.0 |
| OS | Debian 12 (Linux) — **không có Xcode** |
| `eas-cli` | 27.11.0 (dùng `npx eas-cli@latest`) |

## Lệnh theo nhóm quyền

**Read-only (chạy luôn):**

- `cat`, `head`, `tail`, `grep`, `rg`, `diff`, `ls`, `stat`
- `npx tsc --noEmit` — typecheck
- `npx expo lint` — lint
- `npx expo-doctor` — chẩn đoán
- `git status/log/diff/show`
- Đọc `/data/portal/` và `simba-docs/` để tra nghiệp vụ (read-only)

**Ghi local (chạy luôn):**

- Sửa file trong `src/`, `docs/`
- `npm install` / `npx expo install` — cài dependency vào `node_modules`
- `git checkout -b`, `git add`, `git commit`
- `npx expo start` — dev server local

**Cần Sếp duyệt:**

- `git push`, `gh pr create/edit`, `gh pr merge/close`
- `git push origin main`, `git reset --hard`, `git clean -fd`, force push
- Sửa `app.json` (name, scheme, icons, plugins)
- `npx eas-cli@latest build` / `submit` / `update` — tốn quota, có thể publish ra ngoài
- `npx expo prebuild` — sinh `ios/`/`android/`
- Bất kỳ thao tác ghi vào `/data/portal/` (đó là repo khác — phải là task riêng)
- Network ngoài: gọi API production, publish

## Lưu ý môi trường

- **Không có Xcode** trên máy này → không `expo run:ios`. Dùng Expo Go để xem, EAS để build thật.
- `web.output` trong `app.json` là `"server"` → export web cần `npx expo serve dist`, không chỉ static hosting.
- Expo Go yêu cầu đăng nhập tài khoản Expo (từ SDK 57).
- Tunnel (`npx expo start --tunnel`) dùng khi máy Sếp khác mạng với máy dev.

## Đường dẫn tra cứu Portal

| Cần gì | Đường dẫn |
|---|---|
| Nghiệp vụ, bảng, SP | `/data/portal/simba-docs/` |
| Component gốc | `/data/portal/diepxuan/laravel-catalog/src/Http/Livewire/` |
| View gốc | `/data/portal/diepxuan/laravel-catalog/resources/views/` |
| Design token | `/data/portal/docs/DESIGN.md` |
| Quy ước dự án | `/data/portal/docs/PROJECT_CONVENTIONS.md` |
| Cách tư duy/verify | `/data/portal/docs/AGENT-THINKING-PROTOCOL.md` |
| API hiện có | `/data/portal/diepxuan/laravel-catalog/routes/api.php` |

Chi tiết đầy đủ: `docs/PORTAL-REFERENCE.md`.

## Sandbox & Escalation

- Workspace ở `/data/portal-app/`, ngoài session workspace mặc định của một số runtime → thao tác ghi có thể bị từ chối; khi đó dừng, xin escalation đúng một lần kèm justification tiếng Việt 1 dòng.
- Không né sandbox bằng flag.
