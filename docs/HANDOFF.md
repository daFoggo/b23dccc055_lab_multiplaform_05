# Bàn giao ChatApp (Bài thực hành 5) – trạng thái 2026-10-28

Nhánh `feat/chat-realtime`. Thư mục: `D:\Dev_Projects\b23dccc055_lab_multi_platform`.
Thiết kế: `docs/superpowers/specs/2026-10-28-chat-realtime-design.md`. Plan: `docs/superpowers/plans/2026-10-28-chat-realtime.md` (13 task đầy đủ).

---

## 1. Trạng thái các Task (Đã hoàn thành 100%)

| Task | Nội dung | Trạng thái |
|:---:|---|:---:|
| 1 | Tách base RN CLI từ MidTermTest, đổi tên ChatApp / `com.chatapp` | **Xong** |
| 2 | Docs gốc: de-bai, danh-gia, data-model, firebase-rules.json, firebase-setup, README | **Xong** |
| 3 | Theme Paper MD3 gốc + font Inter (`src/theme`) | **Xong** |
| 4 | Firebase init, auth-service, user/presence service | **Xong** |
| 5 | Màn Đăng nhập / Đăng ký + AuthProvider | **Xong** |
| 6 | Điều hướng (stack + tab Paper BottomNavigation.Bar) | **Xong** |
| 7 | Danh bạ + presence online/offline realtime + tìm kiếm | **Xong** |
| 8 | chat-service + logic thuần (chatId, groupByDay, maps…) | **Xong** |
| 9 / 9b | Màn Chat (optimistic theo id, phân trang, markRead) + font MaterialCommunityIcons | **Xong** |
| 10 | Gửi vị trí + bong bóng vị trí mở Google Maps | **Xong** |
| 11 | Home (danh sách hội thoại, badge chưa đọc dùng chung qua `ConversationsProvider`) | **Xong** |
| 12 | Thông báo + Cài đặt (đăng xuất có Dialog xác nhận Paper) | **Xong** |
| 13 | Hoàn thiện kiến trúc (`docs/architecture.md`), checklist `docs/danh-gia-de-bai.md`, README, sửa icon docs | **Xong** |
| Refactor | Revert design system về chuẩn gốc MD3 của React Native Paper, tuân thủ composition, font Inter | **Xong** |

Kiểm tra chất lượng mã nguồn:
- **Jest**: 33 test suites passed, 214 tests passed, 0 failed.
- Cảnh báo worker force exit / timer leak đã được xử lý triệt để (unmount sạch sẽ trong tests).
- **TypeScript**: `npx tsc --noEmit` hoàn toàn sạch (0 lỗi).
- **ESLint**: `npm run lint` hoàn toàn sạch (0 lỗi, 0 cảnh báo).

---

## 2. Hệ thống thiết kế & Composition

- Sử dụng React Native Paper mặc định (Material Design 3) với roundness gốc (`roundness: 4`), không ép phẳng giả lập.
- Tuân thủ composition tuyệt đối:
  - Form: `TextInput mode="outlined"` với `TextInput.Icon` (email, lock, eye) và `HelperText type="error"`.
  - Thẻ thông tin: `Card mode="elevated"` / `mode="contained"` với `Card.Title`, `Card.Content`, `Card.Actions`.
  - Danh sách: `List.Item` với avatar, divider phân cách, badge chưa đọc.
  - Hộp thoại: `Dialog.Icon`, `Dialog.Title`, `Dialog.Content`, `Dialog.Actions`.
  - Thanh nhập tin nhắn: `Surface elevation={2}` với `IconButton` vị trí và gửi tin.
- Font Inter đồng bộ toàn ứng dụng (Regular, SemiBold, Bold) kết hợp với `fontWeight: 'normal'` tối ưu cho Android.

---

## 3. Firebase (project `lab-realtime-chat-24243`)

- Web app `ChatApp` đã kết nối trong `src/services/firebase-config.ts`.
- Firebase Authentication (Email/Password) đã kích hoạt.
- Realtime Database: đã deploy toàn bộ luật bảo mật từ `docs/firebase-rules.json`.
- Tài khoản thử nghiệm: `user1@gmail.com` và `user2@gmail.com` (mật khẩu trong `.superpowers/test-accounts.md`).

---

## 4. Công việc người dùng chuẩn bị nộp bài

1. Chụp ảnh màn hình ứng dụng:
   - Đăng ký tài khoản mới.
   - Home có hiển thị badge tin chưa đọc.
   - Danh bạ có trạng thái online.
   - Chat có cả tin nhắn văn bản và tin nhắn vị trí.
2. Chụp ảnh Firebase Console: Tab Data (Realtime Database) và Tab Users (Authentication).
3. Quay video 1 - 2 phút giữa 2 máy / máy ảo chat trực tiếp với nhau.
