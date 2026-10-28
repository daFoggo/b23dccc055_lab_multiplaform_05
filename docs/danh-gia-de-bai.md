# Đối chiếu đề bài Bài 5

Trạng thái: "chưa làm" cho đến khi Task 13 cập nhật. Đường dẫn là file dự kiến (theo spec mục 6.4).

| Mục | Yêu cầu của đề | File chịu trách nhiệm | Trạng thái |
|---|---|---|---|
| 1 | Tạo project Firebase, bật Email/Password và Realtime Database, áp dụng luật | `docs/firebase-setup.md`, `docs/firebase-rules.json` | chưa làm |
| 1 | Màn hình Đăng ký: họ tên, email, mật khẩu (>= 6 ký tự), nhập lại mật khẩu | `src/features/auth/` (màn Register, validation) | chưa làm |
| 1 | Đăng nhập bằng Firebase; sai tài khoản/mật khẩu thì báo lỗi | `src/services/auth-service.ts`, `src/features/auth/` (màn Login) | chưa làm |
| 1 | Đăng xuất ở Cài đặt, quay về Đăng nhập | `src/features/settings/`, `src/features/auth/auth-context.tsx` | chưa làm |
| 2 | Danh sách người dùng đã đăng ký, không gồm bản thân | `src/services/user-service.ts`, `src/features/contacts/` | chưa làm |
| 2 | Trạng thái online/offline theo thời gian thực | `src/services/presence-service.ts`, `src/features/contacts/` | chưa làm |
| 2 | Ô tìm kiếm; nhấn một người để mở Chat | `src/features/contacts/` | chưa làm |
| 3 | Gửi/nhận tin ngay lập tức, không tải lại | `src/services/chat-service.ts`, `src/features/chat/` (hook nghe tin) | chưa làm |
| 3 | Tin của mình bên phải, của người kia bên trái, có thời gian | `src/features/chat/` (bong bóng), `src/lib/format-time.ts` | chưa làm |
| 3 | Không gửi tin rỗng; tự cuộn xuống tin mới nhất | `src/features/chat/` | chưa làm |
| 3 | Tiêu đề hiển thị tên và trạng thái online của người đang chat | `src/features/chat/` (header) | chưa làm |
| 4 | Nút 📍 gửi vị trí; xin quyền; từ chối thì thông báo | `src/services/location-service.ts`, `src/features/chat/` | chưa làm |
| 4 | Tin vị trí hiển thị khác; nhấn mở Google Maps đúng tọa độ | `src/features/chat/components/` (thẻ vị trí) | chưa làm |
| 5 | Home: ảnh đại diện, tên, tin cuối, thời gian; mới nhất trên cùng | `src/features/home/` | chưa làm |
| 5 | Số chưa đọc tăng ngay khi có tin mới, về 0 khi mở cuộc trò chuyện | `src/services/chat-service.ts`, `src/features/home/` | chưa làm |
| 6 | React Native CLI (không Expo) và React Navigation | `package.json`, `src/navigation/` | chưa làm |
| 6 | Firebase JS SDK (`firebase/auth`, `firebase/database`), `@react-native-community/geolocation` | `src/services/` | chưa làm |
| 6 | Gom code Firebase vào `src/services/` | `src/services/` | chưa làm |
| 6 | Hủy lắng nghe trong cleanup của `useEffect` | hook trong `src/features/*` | chưa làm |
| 6 | Màn hình Thông báo giữ như Bài 4 | `src/features/notifications/` | chưa làm |
| 7 | Mã nguồn (không kèm `node_modules`, `android/build`, `ios/Pods`) | toàn repo, `.gitignore` | chưa làm |
| 7 | Ảnh chụp: Đăng ký, Home có chưa đọc, Danh bạ online, Chat có tin thường và vị trí | `docs/firebase-setup.md` (danh sách ảnh) | chưa làm |
| 7 | Ảnh Firebase Console (tab Data) cho thấy tin nhắn | `docs/firebase-setup.md` | chưa làm |
| 7 | Video 1-2 phút, 2 máy chat với nhau | do người dùng thực hiện | chưa làm |
