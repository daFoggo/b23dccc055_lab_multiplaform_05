# Thiết lập Firebase

Project đã tạo: `lab-realtime-chat-24243`. `databaseURL`:
`https://lab-realtime-chat-24243-default-rtdb.asia-southeast1.firebasedatabase.app`

`apiKey` và `appId` chưa có (đang chờ người dùng lấy từ Console). Không tự điền hay đoán khóa.

## Cách 1: Firebase Console

1. Vào https://console.firebase.google.com, mở (hoặc tạo) project `lab-realtime-chat-24243`.
2. Project settings > Your apps > thêm **Web app** (`</>`), lấy đối tượng `firebaseConfig`.
3. Build > Authentication > Get started > Sign-in method > bật **Email/Password**.
4. Build > Realtime Database > Create database (vùng `asia-southeast1`), ghi lại `databaseURL`.
5. Tab **Rules**: dán toàn bộ nội dung `docs/firebase-rules.json` rồi **Publish**.
6. Điền `src/services/firebase-config.ts`:

```ts
export const firebaseConfig = {
  apiKey: '<API_KEY_CHO_NGUOI_DUNG_DIEN>',
  authDomain: 'lab-realtime-chat-24243.firebaseapp.com',
  databaseURL:
    'https://lab-realtime-chat-24243-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'lab-realtime-chat-24243',
  appId: '<APP_ID_CHO_NGUOI_DUNG_DIEN>',
};
```

(Không commit khóa thật nếu repo công khai; `apiKey` của Web app không phải bí mật nhưng vẫn nên giữ gọn.)

## Cách 2: Firebase CLI

Chỉ là hướng dẫn, repo chưa có `firebase.json`.

```sh
firebase login
firebase apps:sdkconfig web          # in ra firebaseConfig (apiKey, appId...)
```

Để triển khai luật, tạo `firebase.json` ở gốc repo:

```json
{
  "database": {
    "rules": "docs/firebase-rules.json"
  }
}
```

rồi chạy:

```sh
firebase deploy --only database --project lab-realtime-chat-24243
```

## Tạo 2 tài khoản test

Chạy app, dùng màn Đăng ký tạo hai tài khoản (ví dụ `a@test.com` và `b@test.com`, mật khẩu >= 6 ký tự). Đăng nhập mỗi tài khoản trên một máy ảo/thiết bị.

## Ảnh cần chụp (mục 7 của đề)

1. Màn Đăng ký.
2. Home có số tin chưa đọc.
3. Danh bạ có trạng thái online.
4. Chat có tin thường và tin vị trí.
5. Firebase Console, tab Data, cho thấy `chats/.../messages`.
6. Video 1-2 phút, hai máy chat với nhau, tin hiện ngay.
