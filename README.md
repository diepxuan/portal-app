# portal-app

Ứng dụng di động cho hệ thống [Portal](https://github.com/diepxuan/portal) — xây bằng Expo (React Native),
một codebase cho **iOS + Android + Web**.

## Trạng thái

| Hạng mục | Trạng thái |
|---|---|
| Scaffold Expo SDK 58 | ✅ xong |
| Typecheck / lint | ✅ pass |
| Tài liệu dự án | ✅ xong |
| API backend | ⛔ **chưa có** — Portal chưa mở endpoint cho app (xem `docs/API-CONTRACT.md`) |
| Build iOS | ⛔ chờ Apple Developer Program |

## Yêu cầu hệ thống

- Node.js `^22.13 || ^24.3 || ^26 || >=27`
- npm 10+

## Bắt đầu

```bash
npm install
npx expo start          # mở web / Expo Go
npx expo start --tunnel # test trên máy thật khác mạng
```

Phím tắt trong terminal: `w` = web, `a` = Android, `i` = iOS (cần macOS).

## Lệnh thường dùng

```bash
npx expo install <pkg>   # cài package — LUÔN dùng lệnh này
npx tsc --noEmit         # typecheck
npx expo lint            # lint
npx expo-doctor          # chẩn đoán
npx expo export --platform web   # build web
```

## Cấu trúc

```
src/
├── app/          Expo Router routes (mỗi file = 1 screen)
├── components/   UI component
├── hooks/        custom hooks
├── constants/    hằng số
├── api/          HTTP client (sẽ thêm)
└── tokens/       design token port từ Portal (sẽ thêm)
docs/             tài liệu dự án
assets/           icon, splash, image
```

## Tài liệu quan trọng

| File | Nội dung |
|---|---|
| `AGENTS.md` | Protocol vận hành cho agent, boot sequence |
| `docs/PORTAL-REFERENCE.md` | **Bắt buộc** — bản đồ tra cứu nghiệp vụ trong repo Portal |
| `docs/ARCHITECTURE.md` | Kiến trúc app + API + quan hệ với Portal |
| `docs/API-CONTRACT.md` | Endpoint cần có, auth, convention |
| `docs/DESIGN-TOKENS.md` | Đồng bộ giao diện với Portal |
| `docs/WORKFLOW.md` | Git flow, verify, quy trình task |
| `MEMORY.md` | Quyết định đã chốt, trạng thái, backlog |

## Nguyên tắc cốt lõi

**App này không chứa nghiệp vụ.** Toàn bộ tên bảng, stored procedure, field, nhãn tiếng Việt,
quy tắc validate đều nằm ở repo Portal (`/data/portal/`) và `simba-docs/`.

Trước khi dựng bất kỳ màn hình nào: đọc `docs/PORTAL-REFERENCE.md` → mở Livewire component gốc
trong Portal → dựng theo đúng hành vi đó.

## Build iOS / Android

Máy dev là Linux (không có Xcode) → build qua EAS Cloud:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform ios --profile development
npx eas-cli@latest build --platform android --profile development
```

Cần: tài khoản Expo + (với iOS) Apple Developer Program.

## License

MIT — xem `LICENSE`.
