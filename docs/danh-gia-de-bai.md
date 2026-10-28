# Đối chiếu đề bài Bài thực hành 5

Bảng đối chiếu từng yêu cầu trong đề bài Bài 5 với mã nguồn và kiểm thử thực tế của dự án `ChatApp`.

| Mục | Yêu cầu của đề | File chịu trách nhiệm | Kiểm thử tự động (Unit/Integration Test) | Trạng thái |
|:---:|---|---|---|:---:|
| **1** | Tạo project Firebase, bật Email/Password và Realtime Database, áp dụng luật | `src/services/firebase-config.ts`, `docs/firebase-rules.json`, `firebase.json` | Đã deploy luật qua `firebase deploy --only database` | **Đã xong** |
| **1** | Màn hình Đăng ký: họ tên, email, mật khẩu (>= 6 ký tự), nhập lại mật khẩu | `src/features/auth/screens/register-screen.tsx`, `validation.ts` | `register-screen.test.tsx`, `validation.test.ts` (100% pass) | **Đã xong** |
| **1** | Đăng nhập bằng Firebase; sai tài khoản/mật khẩu thì báo lỗi tiếng Việt | `src/services/auth-service.ts`, `src/features/auth/screens/login-screen.tsx` | `login-screen.test.tsx`, `auth-service.test.ts` | **Đã xong** |
| **1** | Đăng xuất ở Cài đặt, có hộp thoại xác nhận, quay về Đăng nhập | `src/features/settings/screens/settings-screen.tsx`, `root-navigator.tsx` | `settings-screen.test.tsx`, `navigation.test.tsx` | **Đã xong** |
| **2** | Danh sách người dùng đã đăng ký, loại trừ bản thân | `src/services/user-service.ts`, `src/features/contacts/screens/contacts-screen.tsx` | `user-service.test.ts`, `contacts-screen.test.tsx` | **Đã xong** |
| **2** | Trạng thái online/offline theo thời gian thực (kèm thời gian hoạt động gần nhất) | `src/services/presence-service.ts`, `src/lib/format-time.ts` | `presence-service.test.ts`, `format-time.test.ts` | **Đã xong** |
| **2** | Ô tìm kiếm người dùng (không phân biệt hoa/thường, dấu); nhấn mở Chat 1-1 | `src/lib/filter-users.ts`, `src/features/contacts/screens/contacts-screen.tsx` | `filter-users.test.ts`, `contacts-screen.test.tsx` | **Đã xong** |
| **3** | Gửi/nhận tin nhắn tức thì theo thời gian thực, không cần tải lại | `src/services/chat-service.ts`, `src/features/chat/hooks/use-messages.ts` | `chat-service.test.ts`, `use-messages.test.tsx` | **Đã xong** |
| **3** | Tin của mình bên phải, của người khác bên trái, có thời gian gửi | `src/features/chat/components/message-bubble.tsx`, `src/theme/colors.ts` | `message-bubble.test.tsx` | **Đã xong** |
| **3** | Không cho gửi tin rỗng / khoảng trắng; tự cuộn xuống tin mới nhất | `src/lib/messages.ts`, `src/features/chat/screens/chat-screen.tsx` | `messages.test.ts`, `chat-screen.test.tsx` | **Đã xong** |
| **3** | Tiêu đề màn hình hiển thị tên và trạng thái online/offline của bạn chat | `src/features/chat/screens/chat-screen.tsx`, `use-peer.ts` | `chat-screen.test.tsx` | **Đã xong** |
| **4** | Nút 📍 gửi vị trí; xin quyền vị trí; từ chối quyền thì thông báo rõ ràng | `src/services/location-service.ts`, `src/features/chat/screens/chat-screen.tsx` | `location-service.test.ts`, `chat-screen.test.tsx` | **Đã xong** |
| **4** | Tin vị trí hiển thị khác biệt; nhấn mở Google Maps đúng tọa độ | `src/features/chat/components/location-bubble.tsx`, `src/lib/maps.ts` | `location-bubble.test.tsx`, `maps.test.ts` | **Đã xong** |
| **5** | Home: avatar, tên, xem trước tin cuối, thời gian; cuộc trò chuyện mới nhất trên cùng | `src/features/home/screens/home-screen.tsx`, `src/services/chat-service.ts` | `home-screen.test.tsx`, `chat-service.test.ts` | **Đã xong** |
| **5** | Số tin chưa đọc tăng ngay khi có tin mới; tự động về 0 khi mở cuộc trò chuyện | `src/services/chat-service.ts`, `conversations-context.tsx`, `tab-navigator.tsx` | `conversations-context.test.tsx`, `navigation.test.tsx` | **Đã xong** |
| **6** | React Native CLI (không dùng Expo) và React Navigation | `package.json`, `android/`, `ios/`, `src/navigation/` | `App.test.tsx`, `navigation.test.tsx` | **Đã xong** |
| **6** | Firebase JS SDK (`firebase/auth`, `firebase/database`), `@react-native-community/geolocation` | `package.json`, `src/services/` | Đã cấu hình và kiểm thử | **Đã xong** |
| **6** | Gom mã nguồn Firebase vào `src/services/` (không rải rác ngoài màn hình) | `src/services/` | Kiểm tra grep không còn `firebase/` ngoài `src/services/` | **Đã xong** |
| **6** | Hủy lắng nghe realtime trong cleanup của `useEffect` | Tất cả hooks trong `src/features/*/hooks` | `use-messages.test.tsx`, `use-conversations.test.tsx` | **Đã xong** |
| **6** | Màn hình Thông báo giữ theo cấu trúc Bài 4 | `src/features/notifications/screens/notifications-screen.tsx` | `notifications-screen.test.tsx` | **Đã xong** |
| **6** | Revert design system về gốc default React Native Paper MD3, composition chuẩn, font Inter | `src/theme/paper-theme.ts`, `colors.ts`, các màn hình trong `src/features/` | `paper-theme.test.ts`, `theme.test.ts` | **Đã xong** |
| **7** | Mã nguồn sạch (loại trừ `node_modules`, `android/build`, `.git` khi nộp) | `.gitignore` | Sạch theo chuẩn | **Đã xong** |

---

## Danh mục sản phẩm demo đã tạo trong thư mục `docs/demo/`

1. **Ảnh chụp màn hình ứng dụng (`docs/demo/screenshots/`)**:
   - [x] Ảnh 1: [01_dang_ky.png](file:///d:/Dev_Projects/b23dccc055_lab_multi_platform/docs/demo/screenshots/01_dang_ky.png) - Màn hình Đăng ký tài khoản mới (MD3, Inter font).
   - [x] Ảnh 2: [02_home_chua_doc.png](file:///d:/Dev_Projects/b23dccc055_lab_multi_platform/docs/demo/screenshots/02_home_chua_doc.png) - Màn hình Home (Trò chuyện) có hiển thị badge số tin chưa đọc trên hàng và tab bar.
   - [x] Ảnh 3: [03_danh_ba_online.png](file:///d:/Dev_Projects/b23dccc055_lab_multi_platform/docs/demo/screenshots/03_danh_ba_online.png) - Màn hình Danh bạ hiển thị người dùng với chấm xanh online.
   - [x] Ảnh 4: [04_chat_tin_nhan_va_vi_tri.png](file:///d:/Dev_Projects/b23dccc055_lab_multi_platform/docs/demo/screenshots/04_chat_tin_nhan_va_vi_tri.png) - Màn hình Chat có tin nhắn thường, tin nhắn vị trí và nút mở Google Maps.

2. **Video demo 2 thiết bị tương tác realtime (`docs/demo/video/`)**:
   - [x] Video ghép song song 2 máy ảo: [demo_chat_realtime.mp4](file:///d:/Dev_Projects/b23dccc055_lab_multi_platform/docs/demo/video/demo_chat_realtime.mp4)
     - Quay đồng thời User 1 (`emulator-5556`) và User 2 (`emulator-5554`).
     - Tin nhắn gửi qua lại tức thì real-time không cần tải lại trang.
     - Bấm nút 📍 gửi vị trí GPS tạo LocationBubble real-time.
