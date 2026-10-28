# ChatApp

Bài thực hành 5 (Lập trình đa nền tảng - RIPT1412-20261-02): Ứng dụng chat 1-1 thời gian thực với Firebase, phát triển bằng React Native CLI (không Expo), TypeScript, React Native Paper (Material Design 3 default) và font Inter.

---

## 1. Tính năng hoàn thành

- **Xác thực người dùng (Firebase Auth)**:
  - Đăng ký tài khoản (họ tên, email, mật khẩu >= 6 ký tự, nhập lại mật khẩu).
  - Đăng nhập với thông báo lỗi tiếng Việt trực quan.
  - Tự động ghi nhớ phiên đăng nhập qua AsyncStorage persistence.
  - Đăng xuất an toàn từ màn hình Cài đặt với hộp thoại xác nhận (Dialog).
- **Danh bạ & Trạng thái hiện diện (Presence)**:
  - Danh sách người dùng đã đăng ký trong hệ thống, loại trừ chính mình.
  - Theo dõi trạng thái online / offline thời gian thực qua `.info/connected` và cơ chế `onDisconnect`.
  - Hiển thị thời gian hoạt động gần nhất (ví dụ: *Hoạt động 5 phút trước* hoặc *Ngoại tuyến*).
  - Thanh tìm kiếm người dùng không phân biệt chữ hoa/thường hay dấu tiếng Việt.
- **Chat 1-1 thời gian thực (Realtime Chat)**:
  - Gửi và nhận tin nhắn văn bản tức thì theo thời gian thực không cần tải lại trang.
  - Optimistic UI: tin nhắn hiện ngay lập tức với trạng thái đang gửi (`pending`), hỗ trợ gửi lại nếu gặp lỗi mạng (`failed`).
  - Phân chia tin nhắn của mình bên phải, của đối phương bên trái, kèm nhãn thời gian và nhóm tin theo ngày (*Hôm nay*, *Hôm qua*, ngày cụ thể).
  - Tự động cuộn xuống tin nhắn mới nhất; chặn gửi tin nhắn rỗng hoặc chỉ toàn khoảng trắng.
- **Chia sẻ vị trí GPS (Location Sharing)**:
  - Nút bấm 📍 gửi vị trí hiện tại kèm xin quyền truy cập vị trí trên thiết bị (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`).
  - Tin nhắn vị trí hiển thị dưới dạng thẻ riêng biệt với tọa độ chính xác.
  - Nhấn vào tin nhắn vị trí để mở ứng dụng Google Maps đúng tọa độ.
- **Trang chủ & Quản lý thông báo (Home & Unread Count)**:
  - Danh sách cuộc trò chuyện gần nhất được sắp xếp theo thời gian mới nhất lên đầu.
  - Hiển thị ảnh đại diện, tên, xem trước tin nhắn cuối cùng (hoặc nhãn *📍 Vị trí*).
  - Badge số tin chưa đọc cập nhật tự động khi có tin mới và tự động về 0 khi người dùng mở cuộc trò chuyện.
- **Hệ thống thiết kế (Design System)**:
  - Chuẩn gốc Material Design 3 của React Native Paper.
  - Tuân thủ tuyệt đối quy tắc composition của components (`Card.Title`, `Card.Content`, `Card.Actions`, `TextInput.Icon`, `Dialog.Icon`, `List.Section`, `Divider`...).
  - Sử dụng toàn bộ hệ font Inter (Regular, SemiBold, Bold) đồng bộ trên toàn ứng dụng.

---

## 2. Hướng dẫn chạy ứng dụng

### Yêu cầu môi trường
- Node.js >= 18
- Android SDK & Java JDK 17
- Máy ảo Android (AVD) hoặc thiết bị thật đã bật USB Debugging

### Các bước khởi chạy

```sh
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi động Metro Bundler (cổng 8081)
npx react-native start

# 3. Chuyển tiếp cổng ADB (nếu dùng máy thật hoặc máy ảo)
adb reverse tcp:8081 tcp:8081

# 4. Build và cài đặt ứng dụng lên thiết bị Android
npx react-native run-android
# hoặc chạy trực tiếp gradle:
# cd android && .\gradlew.bat app:installDebug -PreactNativeDevServerPort=8081
```

> **Lưu ý cấu hình Firebase**: Cấu hình Firebase đã được điền sẵn trong `src/services/firebase-config.ts` kết nối tới project `lab-realtime-chat-24243`. Chi tiết thiết lập xem tại `docs/firebase-setup.md`.

---

## 3. Lệnh kiểm tra chất lượng mã nguồn

Tất cả các kiểm thử đơn vị, kiểm tra kiểu dữ liệu tĩnh và lint đều đạt 100%:

```sh
# Chạy toàn bộ 33 test suites (214 tests pass)
npm test

# Kiểm tra TypeScript static types
npx tsc --noEmit

# Kiểm tra chuẩn mã nguồn ESLint
npm run lint
```

Kết quả thực tế:
- **Jest**: 33 test suites passed, 214 tests passed, 0 failed.
- **TypeScript**: 0 errors.
- **ESLint**: 0 errors, 0 warnings.

---

## 4. Cấu trúc thư mục

```
App.tsx                     # Khởi tạo SafeArea, PaperProvider, AuthProvider, Navigation
src/
  services/                 # Firebase init, auth-service, user, presence, chat, location
  features/                 # Module theo tính năng: auth, home, contacts, chat, notifications, settings
  navigation/               # RootNavigator (stack auth-gated), TabNavigator (bottom-tabs Paper)
  lib/                      # Pure helpers: avatar, chat-id, filter-users, format-time, maps, messages
  theme/                    # Paper MD3 theme (paperTheme, navigationTheme), colors, fonts (Inter), metrics, icons
docs/                       # Toàn bộ tài liệu kỹ thuật, đề bài, đối chiếu và luật RTDB
```

---

## 5. Tài liệu tham khảo

- `docs/de-bai.md`: Đề bài Bài thực hành 5.
- `docs/danh-gia-de-bai.md`: Bảng đối chiếu tiến độ hoàn thành các yêu cầu của đề.
- `docs/architecture.md`: Tài liệu kiến trúc phân tầng, luồng dữ liệu và thiết kế kỹ thuật.
- `docs/data-model.md`: Cấu trúc dữ liệu Firebase Realtime Database và báo cáo đánh giá luật bảo mật.
- `docs/firebase-rules.json`: File luật bảo mật áp dụng cho Realtime Database.
- `docs/firebase-setup.md`: Hướng dẫn cài đặt và cấu hình Firebase Console.
- `docs/design-style.md`: Hướng dẫn phong cách giao diện React Native Paper MD3 + font Inter.
- `docs/HANDOFF.md`: Báo cáo bàn giao trạng thái phát triển.
