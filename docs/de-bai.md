Bài tập mới: BÀI THỰC HÀNH 5: CHAT 1-1 REALTIME VỚI FIREBASE (RIPT1412-20261-02)
Yêu cầu: Phát triển tiếp ứng dụng chat của Bài thực hành 4 bằng React Native CLI. Thay dữ liệu mẫu bằng dữ liệu thời gian thực trên Firebase để hai người dùng nhắn tin trực tiếp với nhau.
1. Đăng ký / Đăng nhập
• Tạo project Firebase, bật Authentication (Email/Password) và Realtime Database, áp dụng luật bảo mật được cung cấp.
• Thêm màn hình Đăng ký gồm họ tên, email, mật khẩu (tối thiểu 6 ký tự) và nhập lại mật khẩu.
• Đăng nhập bằng Firebase. Khi sai tài khoản hoặc mật khẩu thì hiển thị thông báo lỗi.
• Đăng xuất ở màn hình Cài đặt thì quay về màn hình Đăng nhập.
2. Danh bạ
• Lấy danh sách người dùng đã đăng ký từ Firebase (không gồm bản thân).
• Hiển thị trạng thái online/offline cập nhật theo thời gian thực.
• Có ô tìm kiếm. Nhấn vào một người để mở màn hình Chat.
3. Chat 1-1
• Gửi và nhận tin nhắn ngay lập tức, không cần tải lại màn hình.
• Tin của mình nằm bên phải, tin của người kia nằm bên trái, mỗi tin có thời gian.
• Không cho gửi tin rỗng. Danh sách tự cuộn xuống tin mới nhất.
• Thanh tiêu đề hiển thị tên và trạng thái online của người đang chat.
4. Gửi vị trí
• Có nút 📍 để gửi vị trí hiện tại. Xin quyền vị trí; nếu bị từ chối thì hiển thị thông báo.
• Tin nhắn vị trí hiển thị khác tin thường. Nhấn vào thì mở Google Maps đúng tọa độ.
5. Màn hình Home
• Hiển thị các cuộc trò chuyện đã có, gồm ảnh đại diện, tên, tin nhắn cuối và thời gian. Cuộc trò chuyện mới nhất nằm trên cùng.
• Số tin chưa đọc tăng ngay khi có tin mới, và về 0 khi mở cuộc trò chuyện.
6. Yêu cầu kỹ thuật
• React Native CLI (không dùng Expo) và React Navigation.
• Firebase JS SDK (`firebase/auth`, `firebase/database`), `@react-native-community/geolocation`.
• Gom code Firebase vào thư mục `src/services/`.
• Hủy lắng nghe trong cleanup của `useEffect` để tin nhắn không bị hiện lặp.
• Màn hình Thông báo giữ như Bài 4.
7. Sản phẩm cần nộp
1. Mã nguồn dự án (không kèm `node_modules`, `android/build`, `ios/Pods`).
2. Ảnh chụp các màn hình: Đăng ký, Home có số chưa đọc, Danh bạ có trạng thái online, Chat có tin thường và tin vị trí.
3. Ảnh chụp Firebase Console (tab Data) cho thấy dữ liệu tin nhắn.
4. Video 1–2 phút quay 2 máy ảo hoặc thiết bị chat với nhau, cho thấy tin nhắn hiện ngay lập tức.
