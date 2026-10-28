# ChatApp

Bài thực hành 5 (RIPT1412-20261-02): chat 1-1 realtime với Firebase, làm bằng React Native CLI (không Expo) và TypeScript.

## Mục tiêu (chưa hoàn thành)

- Đăng ký / đăng nhập / đăng xuất bằng Firebase Auth (Email/Password).
- Danh bạ có tìm kiếm và trạng thái online/offline thời gian thực.
- Chat 1-1 gửi nhận tức thì, kèm gửi vị trí (mở Google Maps).
- Home liệt kê cuộc trò chuyện với số tin chưa đọc.
- Màn Thông báo và Cài đặt.

Trạng thái từng yêu cầu: xem `docs/danh-gia-de-bai.md`.

## Chạy app

```sh
npm install
npx react-native start
npx react-native run-android   # hoặc: npm run android
```

Cần cấu hình Firebase trước (xem `docs/firebase-setup.md`).

## Lệnh kiểm tra

```sh
npm test
npx tsc --noEmit
npm run lint
```

## Cấu trúc dự kiến

```
App.tsx
src/
  services/      firebase-config, firebase, auth, user, presence, chat, location
  features/      auth, contacts, chat, home, notifications, settings
  navigation/    root-navigator, tab-navigator, types
  lib/           hàm thuần dùng chung (format-time...)
  theme/         colors, fonts, metrics, paper-theme, component-styles
docs/
```

Quy tắc: màn hình -> hook -> `services/`; `services/` không import React; mọi listener được hủy trong cleanup của `useEffect`.

## Tài liệu

- `docs/de-bai.md`: đề bài
- `docs/danh-gia-de-bai.md`: đối chiếu đề bài
- `docs/data-model.md`: mô hình dữ liệu và đánh giá luật
- `docs/firebase-rules.json`: luật Realtime Database
- `docs/firebase-setup.md`: thiết lập Firebase
- `docs/superpowers/specs/2026-10-28-chat-realtime-design.md`: thiết kế
