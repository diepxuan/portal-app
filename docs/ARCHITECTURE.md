# ARCHITECTURE.md — Kiến trúc portal-app

## 1. Tổng quan

`portal-app` là app **universal** (iOS + Android + Web) dùng Expo, giao diện di động cho hệ thống
Portal. Backend và toàn bộ nghiệp vụ nằm ở repo Portal (Laravel + Livewire + SQL Server Simba).

```
┌──────────────────────────────────────────────────────────┐
│  portal-app (repo này)                                   │
│  Expo SDK 58 · React Native 0.88 · Expo Router 58        │
│                                                          │
│  src/app/          routes (file-based)                   │
│  src/components/   UI dùng chung                         │
│  src/api/          client gọi /api/v1                    │
│  src/tokens/       design token port từ Portal           │
│                                                          │
│  ├── iOS      (native)                                   │
│  ├── Android  (native)                                   │
│  └── Web      (react-native-web)                         │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS + Bearer token (Sanctum)
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Portal (repo /data/portal)                              │
│                                                          │
│  routes/api.php           /api/v1/*                      │
│  Livewire 156 component   giao diện web Desktop          │
│  laravel-simba            2.052 SP wrapper               │
│                                                          │
│  ├── MySQL      → users, sessions, jobs, tokens          │
│  └── SQL Server → dữ liệu SimbaERP (business)            │
└──────────────────────────────────────────────────────────┘
```

## 2. Phân chia trách nhiệm

| Tầng | Thuộc repo nào | Ghi chú |
|---|---|---|
| UI web desktop | Portal (Livewire + Blade) | 302 route, giữ nguyên |
| UI mobile | **portal-app** (repo này) | Dựng mới |
| API | Portal | Blocked — xem `API-CONTRACT.md` |
| Nghiệp vụ (tên bảng, SP, validate) | Portal + simba-docs | App chỉ tra, không tự đặt |
| Design token | Portal `docs/DESIGN.md` | App port sang `src/tokens/` |

**Nguyên tắc:** app là lớp trình bày. Không có business rule nào được định nghĩa trong app.

## 3. Cấu trúc thư mục

```
portal-app/
├── src/
│   ├── app/                  # Expo Router routes — MỖI FILE LÀ 1 SCREEN
│   │   ├── _layout.tsx       # root navigator
│   │   ├── index.tsx         # màn hình đầu
│   │   └── (group)/          # nhóm route (auth), (app)
│   ├── components/           # UI component (không phải route)
│   ├── hooks/                # custom hooks
│   ├── constants/            # hằng số theme
│   ├── api/                  # HTTP client + types (sẽ thêm)
│   └── tokens/               # design token port từ Portal (sẽ thêm)
├── assets/                   # icon, splash, image
├── docs/                     # tài liệu dự án (file này)
├── app.json                  # cấu hình Expo
├── package.json
└── tsconfig.json
```

**Quy tắc:** mọi file trong `src/app/` là route. Không đặt logic không-route ở đó.

## 4. Luồng dữ liệu (sau khi có API)

```
Screen (src/app/...)
   ↓ gọi
src/api/client.ts          (fetch + Bearer token + X-Company-Id + X-Year)
   ↓ HTTPS
Portal /api/v1/*           (Laravel Sanctum + Service layer)
   ↓ gọi
Stored procedure SQL Server
   ↓ trả
JSON → screen render
```

## 5. Ràng buộc kỹ thuật

| Ràng buộc | Hệ quả |
|---|---|
| Không có Xcode trên máy dev (Linux) | Build iOS phải qua EAS Cloud, hoặc chạy Expo Go để xem |
| `/ios`, `/android` không commit | Sinh tự động (CNG); cấu hình qua `app.json` + config plugins |
| Expo Go chỉ có module bundled | Thêm thư viện native → phải dev build |
| `web.output: "server"` trong app.json | Web export cần `npx expo serve`, không chỉ static |
| Node engine `^22.13 \|\| ^24.3 \|\| ^26 \|\| >=27` | Máy dev dùng v26.13.0 — OK |

## 6. Điều KHÔNG làm

- Không gọi SQL Server trực tiếp từ app (không có driver, không an toàn).
- Không nhúng session cookie Portal vào app — dùng Bearer token.
- Không viết lại toàn bộ 156 Livewire component sang React trong repo này.
- Không tạo endpoint API mới trong repo này — đó là việc của Portal.
