# Kiến trúc hệ thống ChatApp

Tài liệu mô tả kiến trúc kỹ thuật của ChatApp (Bài thực hành 5 - Lập trình đa nền tảng), xây dựng bằng React Native CLI, TypeScript, React Native Paper (Material Design 3) và Firebase Realtime Database.

---

## 1. Cây thư mục thực tế

```
b23dccc055_lab_multi_platform/
├── App.tsx                     # Điểm khởi động: SafeAreaProvider > PaperProvider > AuthProvider > NavigationContainer
├── index.js                    # Entry point React Native CLI
├── package.json                # Dependencies (React Native 0.88, React 19, Paper 5.15, Firebase 13.1)
├── firebase.json               # Cấu hình Realtime Database trỏ vào docs/firebase-rules.json
├── .firebaserc                 # Project Firebase: lab-realtime-chat-24243
│
├── docs/                       # Tài liệu dự án
│   ├── de-bai.md               # Nguyên văn đề bài Bài thực hành 5
│   ├── danh-gia-de-bai.md      # Bảng đối chiếu tiến độ & checklist hoàn thành
│   ├── data-model.md           # Cấu trúc schema Realtime Database & đánh giá bảo mật
│   ├── firebase-rules.json     # Luật bảo mật Firebase Realtime Database đã deploy
│   ├── firebase-setup.md       # Hướng dẫn thiết lập Firebase Console
│   ├── design-style.md         # Quy chuẩn thiết kế React Native Paper MD3 + font Inter
│   ├── architecture.md         # Tài liệu kiến trúc này
│   └── HANDOFF.md              # Báo cáo bàn giao trạng thái phát triển
│
├── android/                    # Mã nguồn nền tảng Android (com.chatapp)
│   └── app/src/main/
│       ├── AndroidManifest.xml # Cấp quyền ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
│       └── assets/fonts/       # Font Inter (Regular, SemiBold, Bold) và MaterialCommunityIcons.ttf
│
├── ios/                        # Mã nguồn nền tảng iOS (ChatApp)
│
└── src/
    ├── config/
    │   └── app-info.ts         # APP_VERSION đồng bộ với package.json
    │
    ├── services/               # Tầng dịch vụ Firebase & Native (không import React/UI)
    │   ├── firebase-config.ts  # Cấu hình client Firebase (công khai)
    │   ├── firebase.ts         # Khởi tạo App, Auth (với AsyncStorage persistence), RTDB
    │   ├── auth-service.ts     # Đăng ký, đăng nhập, đăng xuất, map mã lỗi tiếng Việt
    │   ├── user-service.ts     # Lưu hồ sơ người dùng, lấy danh sách người dùng
    │   ├── presence-service.ts # Lắng nghe .info/connected, thiết lập online/offline via onDisconnect
    │   ├── chat-service.ts     # Gửi tin thường, gửi vị trí, phân trang, đánh dấu đã đọc
    │   ├── location-service.ts # Xin quyền vị trí và lấy tọa độ GPS thiết bị
    │   └── types.ts            # Định nghĩa UserProfile, ChatMessage, ConversationSummary...
    │
    ├── features/               # Các module chức năng (theo Clean / Feature-first)
    │   ├── auth/               # Xác thực
    │   │   ├── auth-context.tsx# AuthProvider & hook useAuth, gắn kết vòng đời presence
    │   │   ├── validation.ts   # Xác thực form đăng ký / đăng nhập
    │   │   └── screens/        # LoginScreen, RegisterScreen (Paper Card, outlined TextInput)
    │   ├── home/               # Màn hình Trò chuyện
    │   │   ├── conversations-context.tsx # Chia sẻ danh sách hội thoại & tổng badge chưa đọc
    │   │   ├── hooks/use-conversations.ts # Lắng nghe danh sách hội thoại từ RTDB
    │   │   └── screens/home-screen.tsx   # Danh sách cuộc trò chuyện, divider, empty card
    │   ├── contacts/           # Màn hình Danh bạ
    │   │   ├── hooks/use-users.ts        # Lắng nghe danh sách người dùng realtime
    │   │   └── screens/contacts-screen.tsx # Tìm kiếm Searchbar MD3, avatar có chấm online
    │   ├── chat/               # Màn hình Chat 1-1
    │   │   ├── hooks/use-messages.ts     # Quản lý tin nhắn, phân trang, gửi optimistic
    │   │   ├── hooks/use-peer.ts         # Lắng nghe trạng thái online/lastSeen của bạn chat
    │   │   ├── components/
    │   │   │   ├── message-bubble.tsx    # Bong bóng tin nhắn trái/phải, trạng thái gửi/lỗi
    │   │   │   ├── location-bubble.tsx   # Thẻ vị trí tọa độ GPS, nút mở Google Maps
    │   │   │   └── message-input.tsx     # Surface elevation, ô nhập giãn dòng, nút gửi & vị trí
    │   │   └── screens/chat-screen.tsx   # FlatList inverted, cuộn tự động, header thông tin
    │   ├── notifications/      # Màn hình Thông báo mẫu
    │   │   └── screens/notifications-screen.tsx # Danh sách thông báo Paper List.Item
    │   └── settings/           # Màn hình Cài đặt
    │       └── screens/settings-screen.tsx      # Thẻ thông tin cá nhân, version, Dialog đăng xuất
    │
    ├── navigation/             # Điều hướng
    │   ├── types.ts            # RootStackParamList, TabParamList
    │   ├── root-navigator.tsx  # Auth-gated stack (Login/Register <-> Tabs/Chat)
    │   └── tab-navigator.tsx   # Bottom tabs dùng Paper BottomNavigation.Bar + Badge
    │
    ├── lib/                    # Các hàm thuần logic (pure helpers)
    │   ├── avatar.ts           # Hash màu avatar theo uid, sinh chữ cái đầu
    │   ├── chat-id.ts          # Tạo chatId duy nhất từ 2 uid bất kể thứ tự
    │   ├── filter-users.ts     # Tìm kiếm tiếng Việt bỏ dấu & sắp xếp danh bạ
    │   ├── format-time.ts      # Định dạng giờ, ngày (Hôm nay/Hôm qua/dd/MM/yyyy), trạng thái hoạt động
    │   ├── maps.ts             # Tạo link Google Maps theo tọa độ chuẩn
    │   └── messages.ts         # Kiểm tra tin nhắn hợp lệ, gom nhóm theo ngày
    │
    └── theme/                  # Hệ thống thiết kế Material Design 3 (Paper)
        ├── colors.ts           # Palette MD3 Light + token chat (online, bubbleMine/Other)
        ├── fonts.ts            # Cấu hình font Inter (Regular, SemiBold, Bold)
        ├── metrics.ts          # Thang đo khoảng cách (spacing), shape, kích thước bấm (48dp)
        ├── icons.ts            # Tập trung tên icon MaterialCommunityIcons
        ├── paper-theme.ts      # paperTheme (MD3LightTheme) + navigationTheme đồng bộ
        └── component-styles.ts # Hằng số bố cục dùng chung
```

---

## 2. Quy tắc phụ thuộc (Dependency Rules)

Kiến trúc tuân thủ nghiêm ngặt mô hình phân tầng đơn hướng (Unidirectional Dependency):

```
[UI Screens / Components]
        │
        ▼
   [Hooks / Context]
        │
        ▼
   [Services Layer] ──> [Lib Pure Helpers] & [Theme]
        │
        ▼
  [Firebase SDK / Native Modules]
```

1. **Tầng UI (`src/features/*/screens`, `components`)**:
   - Sử dụng React Native Paper làm lõi thành phần giao diện.
   - Tuân thủ composition (ví dụ: `Card.Title`, `Card.Content`, `Card.Actions`; `TextInput.Icon`; `Dialog.Icon`, `Dialog.Title`, `Dialog.Content`, `Dialog.Actions`).
   - Lấy dữ liệu qua custom hooks hoặc Context.
   - **Tuyệt đối không** import trực tiếp Firebase SDK từ màn hình.
   - Mọi màu sắc và kích thước lấy từ `theme = useTheme()` để đồng bộ styling hoàn toàn.

2. **Tầng Hooks & Context (`src/features/*/hooks`, `context`)**:
   - Quản lý trạng thái cục bộ, hiệu ứng phụ (`useEffect`).
   - Mọi `useEffect` đăng ký lắng nghe realtime (`onValue`) **bắt buộc phải trả về hàm hủy (cleanup)** để chống rò rỉ bộ nhớ.

3. **Tầng Dịch vụ (`src/services/`)**:
   - Nơi duy nhất được import `firebase/app`, `firebase/auth`, `firebase/database`, `@react-native-community/geolocation`.
   - Không chứa mã JSX, không import React.
   - Hàm trả về dữ liệu qua Promise hoặc trả về `Unsubscribe` callback cho các luồng realtime.

4. **Tầng Tiện ích thuần (`src/lib/`)**:
   - Hoàn toàn là pure functions (không phụ thuộc React hay Firebase), có test suite độc lập 100% độ phủ.

---

## 3. Các luồng xử lý chính (Core Realtime Workflows)

### 3.1. Luồng Xác thực & Hiện diện (Authentication & Presence)
1. Người dùng đăng nhập thành công qua `loginUser(email, password)`:
   - Firebase Auth cập nhật `currentUser`.
   - `AuthProvider` lắng nghe qua `subscribeAuth`, lưu trạng thái người dùng.
   - Khi có `uid`, gọi `startPresence(uid)`:
     - Lắng nghe đường dẫn đặc biệt `.info/connected` của Realtime Database.
     - Khi `connected === true`, kích hoạt `onDisconnect(ref(db, 'users/' + uid)).update({ online: false, lastSeen: serverTimestamp() })`.
     - Đồng thời ghi `users/{uid}/online = true`.
   - Khi người dùng chủ động đăng xuất:
     - Gọi `setOffline(uid)` ghi `online: false` trước khi gọi `signOut(auth)`.
     - Hủy toàn bộ listener presence.

### 3.2. Luồng Gửi tin nhắn & Đồng bộ Realtime
1. Định danh cuộc trò chuyện:
   - `getChatId(uidA, uidB)` sắp xếp 2 UID theo thứ tự alphabet và nối bằng `_`, đảm bảo hai người luôn truy cập cùng một node `chats/{chatId}`.
2. Gửi tin nhắn (`sendTextMessage` / `sendLocationMessage`):
   - Sinh `messageId` mới bằng `push(ref(db, 'chats/' + chatId + '/messages')).key`.
   - Ghi đồng thời (Multi-path Atomic Update) vào 3 vị trí:
     - `chats/{chatId}/messages/{messageId}`: nội dung tin, loại (`text`/`location`), `senderId`, `createdAt: serverTimestamp()`.
     - `userChats/{myUid}/{peerId}`: cập nhật `lastMessage`, `lastAt`, `lastType`, giữ nguyên `unread` của mình.
     - `userChats/{peerId}/{myUid}`: cập nhật `lastMessage`, `lastAt`, `lastType`.
   - Bước 2: Dùng `runTransaction` tại `userChats/{peerId}/{myUid}/unread` để tăng số tin chưa đọc của người nhận lên +1 (trừ khi người nhận đang mở cuộc trò chuyện).
3. Giao diện Chat:
   - Hiển thị tin nhắn ngay lập tức với trạng thái `pending: true` (optimistic UI).
   - Khi Firebase server xác nhận ghi thành công, tin nhắn tự chuyển sang trạng thái đã gửi. Nếu lỗi mạng/bị chặn, tin đánh dấu `failed: true` và cho phép bấm "Gửi lại".
4. Đánh dấu đã đọc (`markRead`):
   - Khi người dùng mở màn Chat, gọi `markRead(myUid, peerId)` để đặt `userChats/{myUid}/{peerId}/unread = 0`.
   - Badge trên tab "Trò chuyện" và màn hình Home tự động cập nhật về 0 ngay lập tức.

### 3.3. Luồng Gửi vị trí (Location Sharing)
1. Người dùng nhấn nút 📍 trên thanh nhập tin.
2. `getCurrentCoords()` yêu cầu quyền vị trí (`ACCESS_FINE_LOCATION` và `ACCESS_COARSE_LOCATION` trên Android):
   - Nếu từ chối: Ném `LocationPermissionError` -> Hiển thị `Snackbar` kèm nút dẫn tới Cài đặt máy.
   - Nếu chấp nhận: Lấy tọa độ GPS thiết bị qua `@react-native-community/geolocation`.
3. Gửi tin nhắn với `type: 'location'`, lưu `lat` và `lng`.
4. Người nhận nhìn thấy bong bóng vị trí (`LocationBubble`) hiển thị tọa độ đã làm tròn 5 chữ số thập phân, nhấn vào sẽ mở trực tiếp ứng dụng Google Maps với tọa độ chính xác.

---

## 4. Các điểm giới hạn đã biết (Known Limitations)

1. **Gửi tin nhắn 2 bước không hoàn toàn nguyên tử**:
   - Bước ghi nội dung tin nhắn là multi-path update. Bước tăng số lượng chưa đọc (`unread`) được thực hiện bằng `runTransaction` riêng. Nếu mạng bị ngắt đột ngột giữa hai bước, số chưa đọc có thể chênh lệch 1 tin (đã được tài liệu hóa).
2. **Luật bảo mật Realtime Database đối với node `userChats`**:
   - Để người gửi cập nhật được `lastMessage` cho người nhận mà không cần server backend trung gian, luật cho phép peer ghi các trường `lastMessage`, `lastAt`, `lastType`, `unread` vào `userChats/$recipient/$me`. Luật đã có validation độ dài và kiểu dữ liệu để ngăn lạm dụng.
3. **Môi trường iOS**:
   - Dự án tập trung kiểm thử và hoàn thiện cho nền tảng Android (máy thật và máy ảo Android SDK 34-37). Trên iOS, việc load font tuỳ biến và cấp quyền Geolocation cần cấu hình thêm trong `Info.plist` và Podfile.
4. **Màn hình Thông báo**:
   - Do Bài thực hành 4 không có mô tả chi tiết hệ thống Notification backend, màn Thông báo hiện hiển thị danh sách các thông báo mẫu từ hệ thống.
