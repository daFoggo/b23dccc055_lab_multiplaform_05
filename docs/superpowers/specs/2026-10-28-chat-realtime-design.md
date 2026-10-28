# Thiết kế: ChatApp – Bài thực hành 5 (Chat 1-1 realtime với Firebase)

Ngày: 2026-10-28. Trạng thái: **chờ duyệt**. Mục "Quyết định của người dùng" là điều người dùng đã chốt; mục "Quyết định của mình (tạm)" là phần tự đề xuất, cần được kiểm tra.

## 1. Mục đích

Tách một base React Native CLI sạch từ dự án `D:\Dev_Projects\MidTermTest` (PlannerApp): bỏ toàn bộ feature và đề bài cũ, giữ lại **tinh chỉnh styling** của design system đã chốt (M3 kết hợp phẳng kiểu wattprint, font Inter). Trên base đó làm Bài thực hành 5 (RIPT1412-20261-02): chat 1-1 realtime bằng Firebase. Viết lại đề bài, plan, tài liệu, cấu trúc từ đầu.

Lý do: bài nộp chấm theo đề; base cũ chứa code Planner không còn dùng, và lần này được phép dùng React Native Paper nên không cần duy trì bộ component tự dựng.

## 2. Mục tiêu / không mục tiêu / điều phải tránh

**Mục tiêu**
- Đáp ứng đủ 7 mục của đề (xem `docs/de-bai.md` và bảng đối chiếu `docs/danh-gia-de-bai.md`).
- Giao diện nhất quán nhờ một theme Paper duy nhất chứa toàn bộ tinh chỉnh phẳng.
- Code Firebase gom trong `src/services/`, màn hình không gọi thẳng Firebase.
- Logic thuần (id cuộc trò chuyện, đếm chưa đọc, kiểm tra form, định dạng giờ) có test.

**Không mục tiêu**
- Dark mode, đẩy thông báo thật (FCM), gửi ảnh, nhóm chat, iOS đầy đủ (font Inter và quyền vị trí chỉ làm cho Android; iOS ghi nhận là chưa làm).
- Màn Thông báo có chức năng thật (đề chỉ nói "giữ như Bài 4").

**Điều phải tránh** (dù chạy được vẫn coi là hỏng)
- Tin nhắn hiện lặp do quên hủy listener.
- Trộn style tuỳ biến rải rác từng màn hình thay vì đặt ở theme.
- Giữ lại component/hàm "custom" của base cũ chỉ để phục vụ việc tự dựng UI.

## 3. Ràng buộc

- React Native CLI 0.88 (không Expo), TypeScript, React Navigation, npm.
- Firebase JS SDK (`firebase/auth`, `firebase/database`), `@react-native-community/geolocation`, **react-native-paper** (được phép lần này).
- Code Firebase chỉ trong `src/services/`; `useEffect` luôn trả về hàm hủy listener.
- Nộp: mã nguồn (không `node_modules`, `android/build`, `ios/Pods`), ảnh chụp màn hình, ảnh Firebase Console, video 1–2 phút.
- Thư mục dự án: `D:\Dev_Projects\b23dccc055_lab_multi_platform`, tên app `ChatApp`.

## 4. Các phương án đã cân nhắc (cách dùng Paper)

| Phương án | Đánh đổi |
| --- | --- |
| A. Paper làm lõi, màn hình dùng thẳng Paper, tinh chỉnh ở theme | Ít code nhất; style phẳng nằm ở theme nên không lặp |
| B. Bọc Paper trong `components/ui` giữ tên cũ | Thêm một lớp bọc; trái ý "bỏ hết phần custom" |
| C. Giữ component tự dựng, Paper chỉ cho Dialog/Snackbar | Gần như không tận dụng Paper |

**Người dùng chọn A**: Paper làm lõi, bỏ hết code custom của base cũ, chỉ giữ tinh chỉnh styling.

## 5. Quyết định của người dùng

1. Dùng Paper làm lõi UI; xóa mọi component/hàm tự dựng chỉ phục vụ việc custom.
2. Giữ nguyên design system: M3 (seed `#6750A4`) kết hợp phẳng kiểu wattprint (`D:\Dev_Projects\wattprint-expo\docs\design-system\wattprint-design-system.html`): nền xám `#F4F4F4`, thẻ trắng, thẻ bo 24, điều khiển bo 16, chip/badge/search dạng pill, ô nhập nền xám đặc không viền lúc nghỉ, chỉ hai độ đậm (SemiBold/Bold), phần tử bấm tối thiểu 48dp, header không bóng, font Inter.
3. Xóa đề bài cũ; viết lại đề, plan, docs, structure từ đầu theo Bài 5.

## 6. Thiết kế

### 6.1 Cách giữ tinh chỉnh styling khi dùng Paper làm lõi
- `src/theme/colors.ts`, `fonts.ts`, `metrics.ts`: giữ token hiện có (bỏ `priorityColors`, `statusColors` của Planner; thêm màu dùng cho online/offline và bong bóng chat).
- `src/theme/paper-theme.ts` (mới): dựng `MD3LightTheme` từ token: `colors` (primary, secondaryContainer, surface = `#F4F4F4`, surfaceVariant/ô nhập = `surfaceContainerHigh`, error…), `fonts` (Inter theo từng độ đậm, vì Android chọn đậm theo tên file), `roundness` (16).
- `src/theme/component-styles.ts` (mới): chỉ là **StyleSheet/hằng số** dùng lại (ví dụ style ô nhập phẳng, nội dung nút cao 48, thẻ bo 24), không phải component. Màn hình truyền vào prop `style`/`contentStyle`/`outlineStyle` của Paper. Ngoại lệ có chủ ý: chỉ khi một chỉnh sửa không đạt được bằng theme hoặc style hằng số thì mới tạo component riêng, và ghi lý do vào `docs/design-style.md`.
- Điều hướng: `NavigationContainer` dùng theme của React Navigation lấy từ `adaptNavigationTheme` (Paper) để header/nền khớp.
- Icon: `react-native-vector-icons` (MaterialCommunityIcons - mặc định của Paper).

### 6.2 Điều hướng và màn hình
- Chưa đăng nhập: `Login`, `Register` (native-stack).
- Đã đăng nhập: tab `Home`, `Danh bạ`, `Thông báo`, `Cài đặt` (thanh tab của Paper `BottomNavigation.Bar`, dùng qua prop `tabBar` của bottom-tabs) và màn `Chat` đẩy lên trên tab.
- Trạng thái đăng nhập quyết định cây điều hướng (`onAuthStateChanged` ở `AuthProvider`).
- `Thông báo`: danh sách tĩnh một vài thông báo mẫu (mình tự quyết vì không có tài liệu Bài 4).
- `Cài đặt`: thông tin tài khoản, nút Đăng xuất → về Đăng nhập.

### 6.3 Mô hình dữ liệu Realtime Database
```
users/{uid}                    { name, online, lastSeen }   // không lưu email (tránh lộ PII)
chats/{chatId}/messages/{id}   { senderId, type: 'text'|'location', text?, lat?, lng?, createdAt }
userChats/{uid}/{peerUid}      { peerName, lastMessage, lastType, lastAt, unread }
```
- `chatId` = hai uid sắp xếp rồi nối bằng `_` (ổn định, không phụ thuộc ai mở trước).
- Gửi tin: một lần `update` đa đường dẫn: thêm tin vào `chats/{chatId}/messages`, cập nhật `userChats` của cả hai (người gửi `unread = 0`, người nhận tăng `unread` bằng transaction).
- Mở cuộc trò chuyện: đặt `userChats/{me}/{peer}/unread = 0`; khi đang mở và có tin mới đến thì cũng về 0.
- Online/offline: nghe `.info/connected`; khi kết nối đặt `users/{uid}/online = true` và đăng ký `onDisconnect` đặt `online = false`, `lastSeen`. Đăng xuất đặt `online = false` trước khi `signOut`.
- Home sắp theo `lastAt` giảm dần phía client.
- Luật bảo mật (đề xuất, để dán vào Console; đề không đính kèm bản "được cung cấp"): đọc `users` khi đã đăng nhập; ghi `users/$uid` chỉ chủ; `chats/$chatId` chỉ hai uid trong id đọc/ghi; `userChats/$uid/$peer` đọc chỉ `$uid`, ghi cho `$uid` hoặc `$peer`.

### 6.4 Cấu trúc thư mục
```
App.tsx                      PaperProvider + SafeAreaProvider + AuthProvider + NavigationContainer
src/
  services/                  firebase-config.ts, firebase.ts (init app/auth/db), auth-service.ts,
                             user-service.ts, presence-service.ts, chat-service.ts, location-service.ts
  features/
    auth/                    auth-context.tsx, screens (login, register), validation
    contacts/                screens + hook nghe danh sách user và presence
    chat/                    screens, hooks (nghe tin nhắn), components (bong bóng, thẻ vị trí), chat-id.ts
    home/                    screens, hook nghe userChats
    notifications/           màn tĩnh
    settings/                màn cài đặt
  navigation/                root-navigator, tab-navigator, types
  lib/                       format-time.ts và hàm thuần dùng chung
  theme/                     colors, fonts, metrics, paper-theme, component-styles
docs/                        de-bai, danh-gia-de-bai, architecture, data-model, design-style, material-3, m3/
```
- Hook nghe dữ liệu: mỗi `useEffect` gọi hàm `subscribeX` trong `services/` và `return` hàm hủy.
- Quy tắc phụ thuộc: màn hình → hook → services; `services/` không import React.

### 6.5 Vị trí
- Nút 📍 trong thanh nhập. Android: `PermissionsAndroid` rồi `Geolocation.getCurrentPosition`; bị từ chối thì hiển thị `Snackbar` của Paper.
- Tin vị trí: thẻ riêng (icon + tọa độ/nhãn "Vị trí của tôi"), nhấn mở `https://www.google.com/maps/search/?api=1&query=lat,lng` bằng `Linking`.

### 6.6 Kiểm chứng
- Test jest cho logic thuần (chatId, đếm/đặt lại chưa đọc, kiểm tra form đăng ký, định dạng giờ, sắp xếp Home) và dịch vụ với Firebase được mock.
- `npx tsc --noEmit`, `npm run lint`, `npm test`.
- Chạy thật cần Firebase project và hai thiết bị: người dùng điền khóa và làm các bước nộp bài; mình không chứng minh được chạy thật trên máy thật.

## 7. Phần để người dựng quyết

- Cách tạo native: copy `android/` `ios/` từ MidTermTest rồi đổi tên (hướng đề xuất, vì đã cấu hình font Inter và vector-icons) hay `init` mới rồi chép font vào.
- Phiên bản Paper/Firebase tương thích RN 0.88 và React 19; cấu hình Metro cho entry `firebase/auth` trên RN.
- Có copy `.github/modernize` hay không (mình thiên về không).

## 8. Điểm mình tự quyết (cần kiểm tra)
- Bố cục 4 tab + Chat riêng; `Thông báo` là danh sách tĩnh.
- Avatar là chữ cái đầu trên nền màu theo hash uid (Paper `Avatar.Text`), không tải ảnh.
- Mô hình dữ liệu mục 6.3 và bản luật bảo mật đề xuất.
- Gửi tin gồm hai bước, chấp nhận không nguyên tử: (1) một `update` đa đường dẫn ghi tin nhắn và `userChats` của hai bên (preview, `lastAt`, `unread` người gửi = 0); (2) transaction riêng tăng `unread` của người nhận. Luật cho phép người gửi ghi `userChats/$peer/$me`. Nếu bước 2 lỗi thì tin vẫn gửi được, chỉ lệch số chưa đọc; ghi nhận trong docs.
- Danh bạ nghe toàn bộ `users` (bài thực hành chỉ có vài người dùng), không phân trang. `users` không lưu `email` (skill `firebase-security-rules-auditor` coi email công khai là rủi ro PII); email chỉ nằm ở Firebase Auth.
- Tin nhắn nghe bằng `limitToLast(100)` theo `createdAt`.
- Giữ đăng nhập qua lần mở lại app: `initializeAuth` với `getReactNativePersistence(AsyncStorage)` (AsyncStorage đã có sẵn trong base, giữ lại; thêm vào danh sách thư viện).
- Presence chỉ một cờ `online` mỗi người dùng (không đếm nhiều thiết bị).
- Test chỉ dùng mock Firebase, không dùng emulator; `databaseURL` nằm trong `firebase-config.ts` để người dùng điền đúng vùng.
- Đề bài thật (7 mục) lấy nguyên văn từ yêu cầu người dùng gửi để tạo `docs/de-bai.md`; "Thông báo giữ như Bài 4" xử lý bằng danh sách tĩnh vì không có tài liệu Bài 4.
- Theo cách làm của các app chat hiện đại (Telegram, Messenger), người dùng giao cho mình chọn phương án hợp lý: gửi tin lạc quan (hiện ngay với trạng thái "đang gửi", lỗi thì có nút gửi lại); tải tin cũ khi kéo lên (`limitToLast(50)` rồi `endBefore` để nạp thêm) thay cho giới hạn cố định 100; nhóm tin theo ngày bằng nhãn ngày; "hoạt động X phút trước" khi offline; chấm/badge chưa đọc trên Home và trên tab; ô nhập tự giãn tối đa 4 dòng; mở cuộc trò chuyện đưa danh sách xuống tin mới nhất và chỉ tự cuộn khi người dùng đang ở cuối.
- Giữ `docs/material-3.md` và `docs/m3/` làm tham chiếu thiết kế; xóa ảnh demo, plan cũ, de-bai cũ, danh-gia cũ, business-logic cũ.
