# ChatApp (Bài 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tách base RN CLI sạch từ MidTermTest (giữ tinh chỉnh styling, bỏ feature Planner) và làm chat 1-1 realtime bằng Firebase theo đề Bài thực hành 5.

**Architecture:** React Native Paper làm lõi UI; mọi tinh chỉnh phẳng nằm ở `src/theme/` (theme MD3 + style hằng số, không có component tự dựng). Firebase gom trong `src/services/` (hàm `subscribeX` trả về hàm hủy); màn hình → hook → services. Logic thuần ở `src/lib/` có test.

**Tech Stack:** React Native 0.88 CLI, TypeScript, react-native-paper (MD3), React Navigation (native-stack + bottom-tabs), firebase JS SDK (`firebase/auth`, `firebase/database`), `@react-native-community/geolocation`, AsyncStorage, react-native-vector-icons, jest.

**Spec:** `docs/superpowers/specs/2026-10-28-chat-realtime-design.md`

**Skills hỗ trợ (đã cài vào `.claude/skills/`, nguồn `firebase/agent-skills`):** `firebase-basics` (CLI/dự án/cấu hình ứng dụng), `firebase-auth-basics`, `firebase-security-rules-auditor` (dùng ở Task 2 để rà luật). Các skill này viết cho Firestore/native SDK nên phần Realtime Database, JS SDK trên RN vẫn phải tra tài liệu Firebase hiện hành.

## Global Constraints

- Thư mục dự án `D:\Dev_Projects\b23dccc055_lab_multi_platform`, tên app `ChatApp`, package Android `com.chatapp`. Nguồn base: `D:\Dev_Projects\MidTermTest` (không copy `node_modules`, `.git`, `android/build`, `android/app/build`, `.github`, `.superpowers`).
- React Native CLI (không Expo); npm; TypeScript; kebab-case tên file; không barrel file.
- Code Firebase chỉ trong `src/services/`. Mọi `useEffect` có listener phải `return` hàm hủy.
- Ngôn ngữ giao diện tiếng Việt, mật khẩu tối thiểu 6 ký tự, không gửi tin rỗng (chỉ khoảng trắng cũng là rỗng).
- Thang đo chốt: nền `#F4F4F4`, thẻ trắng bo 24, điều khiển bo 16, chip/search pill, ô nhập nền `surfaceContainerHigh` không viền lúc nghỉ, chỉ Inter SemiBold/Bold/Regular (dùng `fontFamily` riêng, không `fontWeight`), phần tử bấm ≥ 48dp, header không bóng.
- Test không gọi Firebase thật: mock `firebase/*`.
- Kiểm chứng mỗi task: `npx tsc --noEmit`, `npm run lint`, `npm test` phải xanh trước khi commit.

## Review Focus

- Mở Chat nhiều lần / rời màn hình: không hiện tin lặp (test: subscribe rồi hủy, callback không gọi sau hủy).
- Gửi tin chỉ có khoảng trắng hoặc xuống dòng: bị chặn (`canSend`).
- Hai uid theo thứ tự bất kỳ: cùng một `chatId` (`getChatId`).
- Tin của chính mình đến khi đang mở Chat: không làm tăng `unread` của mình; mở Chat đưa `unread` về 0.
- Email viết hoa/thừa khoảng trắng khi đăng nhập/đăng ký: được chuẩn hóa; mật khẩu nhập lại khác: có lỗi.
- Người kia chưa từng online (`lastSeen` thiếu): hiển thị "Ngoại tuyến" không lỗi.
- Quyền vị trí bị từ chối hoặc GPS lỗi: Snackbar, không crash, không gửi tin.

---

### Task 1: Tách base và dọn feature cũ

**Files:**
- Create: toàn bộ cây dự án tại thư mục đích (copy từ nguồn rồi sửa): `package.json`, `app.json`, `index.js`, `App.tsx` (khung tối thiểu), `android/`, `ios/`, config jest/eslint/babel/tsconfig, `src/theme/{colors,fonts,metrics}.ts`, `.gitignore`
- Delete (không copy): `src/features/`, `src/components/`, `src/lib/*` cũ, `src/navigation/`, `__tests__/`, `docs/` cũ (trừ `docs/material-3.md`, `docs/m3/` copy nguyên)
- Test: `__tests__/App.test.tsx`

**Interfaces:**
- Produces: dự án chạy được `npm test`, `npx tsc --noEmit`; tên `ChatApp`; theme tokens `colors`, `fontFamily`, `spacing`, `radius`, `typography`, `touchTarget` (bỏ `priorityColors`, `statusColors`, `elevation`).

- [ ] **Step 1: Copy bằng `robocopy`** nguồn → đích, loại trừ các thư mục trong Global Constraints và `docs`, `src` (rồi chép riêng `src/theme/*.ts` và font trong `android/app/src/main/assets/fonts`).
- [ ] **Step 2: Đổi tên** `MidTermTest` → `ChatApp` và `com.midtermtest` → `com.chatapp` (đổi cả thư mục `java/.../midtermtest`, `package` trong Kotlin, `applicationId`/`namespace`, `settings.gradle`, `app.json`, `package.json`, `strings.xml`, thư mục/dự án iOS). Kiểm tra `grep -ri midtermtest` không còn kết quả (ngoài `docs`).
- [ ] **Step 3: Sửa token theme**: bỏ import `Priority` và `priorityColors`/`statusColors`/`elevation`; sửa lại `theme.test.ts` cũ thành `src/theme/theme.test.ts` kiểm tra màu `#RRGGBB`, spacing bội 4, `touchTarget === 48`.
- [ ] **Step 4: Cài thư viện** `react-native-paper`, `@react-navigation/bottom-tabs`, `firebase`, `@react-native-community/geolocation` (dùng phiên bản tương thích RN 0.88/React 19; nếu peer-dependency xung đột ghi lại trong README). Cấu hình `metro.config.js` để `firebase/auth` phân giải đúng entry React Native (`unstable_enablePackageExports`, điều kiện `react-native`) nếu cần.
- [ ] **Step 5: `App.tsx` tối thiểu** (`PaperProvider` + một `Text`) và test `__tests__/App.test.tsx` render không lỗi; thêm `react-native-paper`, `react-native-vector-icons` vào `transformIgnorePatterns`.
- [ ] **Step 6: Verify** `npm test`, `npx tsc --noEmit`, `npm run lint` xanh; `git init` và commit `chore: extract RN base from MidTermTest`.

---

### Task 2: Tài liệu gốc (đề bài, đối chiếu, dữ liệu, luật)

**Files:**
- Create: `docs/de-bai.md`, `docs/danh-gia-de-bai.md`, `docs/data-model.md`, `docs/firebase-rules.json`, `docs/firebase-setup.md`, `README.md`

**Interfaces:**
- Produces: `docs/de-bai.md` là nguyên văn 7 mục đề Bài 5; `firebase-rules.json` là luật dùng ở Task 6/8/10; `firebase-setup.md` liệt kê bước người dùng làm trên Firebase Console.

- [ ] **Step 1: `docs/de-bai.md`** chép nguyên văn đề do người dùng cung cấp (mục 1–7, phần sản phẩm nộp).
- [ ] **Step 2: `docs/danh-gia-de-bai.md`**: bảng mỗi gạch đầu dòng của đề → file chịu trách nhiệm → trạng thái (để "chưa làm"; Task 13 cập nhật).
- [ ] **Step 3: `docs/data-model.md`** và **`docs/firebase-rules.json`** theo mục 6.3 của spec: `users`, `chats/$chatId/messages` (chỉ hai uid trong `chatId` được đọc/ghi; tin nhắn bất biến: tạo được nhưng không sửa/xóa; `.validate` `senderId === auth.uid`, `type` ∈ {text, location}, `text` là string ≤ 2000 ký tự, `lat`/`lng` là số trong khoảng hợp lệ, `createdAt` là timestamp máy chủ; `.indexOn: ["createdAt"]`), `userChats/$uid/$peer` (đọc chỉ `$uid`; ghi cho `$uid` hoặc `$peer`, `.validate` chỉ cho phép các khóa `peerName`, `lastMessage` ≤ 200, `lastType`, `lastAt`, `unread` số nguyên ≥ 0; `$peer` không được đặt `peerName` của người khác). `users/$uid` chỉ có `name`, `online`, `lastSeen` (không lưu email để tránh lộ PII); kiểu và độ dài `name` ≤ 50 được validate. Sau khi viết, tự chạy checklist của skill `firebase-security-rules-auditor` (update bypass, nguồn thẩm quyền, kiểu dữ liệu, giới hạn kích thước) và ghi kết quả vào `docs/data-model.md`.
- [ ] **Step 4: `docs/firebase-setup.md`**: tạo project, thêm Web app lấy config, bật Email/Password, tạo Realtime Database (ghi `databaseURL`), dán luật, điền `src/services/firebase-config.ts`, tạo 2 tài khoản test, các ảnh cần chụp.
- [ ] **Step 5: `README.md`** (chạy app, lệnh kiểm tra, cấu trúc, link docs) rồi commit `docs: add assignment, data model, rules`.

---

### Task 3: Theme Paper và style hằng số

**Files:**
- Create: `src/theme/paper-theme.ts`, `src/theme/component-styles.ts`, `src/theme/paper-theme.test.ts`, `docs/design-style.md`
- Modify: `src/theme/colors.ts` (thêm `online`, `bubbleMine`, `bubbleOther`, `onBubbleMine`, `onBubbleOther`), `App.tsx`

**Interfaces:**
- Produces: `export const paperTheme: MD3Theme`, `export const navigationTheme: NavigationTheme` (từ `adaptNavigationTheme`); `export const flatStyles` gồm `input` (ô nhập phẳng), `inputOutline`, `buttonContent`, `buttonShape`, `card`, `pill`.

- [ ] **Step 1: Failing test** `paper-theme.test.ts`: `paperTheme.colors.primary === '#6750A4'`, `colors.background === '#F4F4F4'`, `paperTheme.roundness === 16`, `paperTheme.fonts.bodyLarge.fontFamily === 'Inter_18pt-Regular'`, `paperTheme.fonts.labelLarge.fontFamily === 'Inter_18pt-SemiBold'`; `navigationTheme.colors.background === '#F4F4F4'`; `flatStyles.card.borderRadius === 24`.
- [ ] **Step 2: Run** `npx jest src/theme/paper-theme.test.ts` → FAIL.
- [ ] **Step 3: Implement** `paperTheme` bằng `MD3LightTheme` + `configureFonts` từ `typography` (map từng biến thể, thay `fontFamily`); `colors` map từ token (`surface`, `surfaceVariant`=`surfaceContainerHigh`, `secondaryContainer`, `error`, `outline`…); `flatStyles` như spec 6.1.
- [ ] **Step 4: Run** test → PASS; `App.tsx` bọc `PaperProvider theme={paperTheme}`.
- [ ] **Step 5: `docs/design-style.md`** viết lại: bảng map token wattprint/M3 → Paper theme/`flatStyles`, quy tắc "không tạo component tự dựng trừ khi ghi lý do".
- [ ] **Step 6: Verify + commit** `feat(theme): paper theme with flat styling`.

---

### Task 4: Khởi tạo Firebase, kiểu dữ liệu và dịch vụ xác thực

**Files:**
- Create: `src/services/firebase-config.ts` (giá trị giả, có chú thích), `src/services/firebase.ts`, `src/services/types.ts`, `src/services/auth-service.ts`, `src/services/auth-service.test.ts`, `jest.setup.js` (mock `firebase/app`, `firebase/auth`, `firebase/database`)

**Interfaces:**
- Produces:
  - `types.ts`: `UserProfile {uid; name; online: boolean; lastSeen?: number}`, `ChatMessage {id; senderId; type: 'text'|'location'; text?; lat?; lng?; createdAt: number; pending?: boolean; failed?: boolean}`, `ConversationSummary {peerId; peerName; lastMessage; lastType: 'text'|'location'; lastAt: number; unread: number}`, `Unsubscribe = () => void`.
  - `firebase.ts`: `export const auth: Auth`, `export const db: Database` (auth dùng `initializeAuth` + `getReactNativePersistence(AsyncStorage)`).
  - `auth-service.ts`: `registerUser(name: string, email: string, password: string): Promise<void>` (tạo tài khoản, `updateProfile`, rồi gọi `createUserProfile(uid, name)`; `createUserProfile` và `setOffline(uid: string): Promise<void>` được tạo ngay trong task này ở `src/services/user-service.ts` và `src/services/presence-service.ts`, Task 7 chỉ bổ sung phần còn lại); `loginUser(email, password): Promise<void>`; `logoutUser(): Promise<void>` (đặt offline trước khi `signOut`); `subscribeAuth(cb: (user: {uid: string; name: string; email: string} | null) => void): Unsubscribe`; `mapAuthError(code: string): string` tiếng Việt cho `auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found`, `auth/email-already-in-use`, `auth/weak-password`, `auth/invalid-email`, `auth/network-request-failed`, mặc định chung.

- [ ] **Step 1: Failing tests** `auth-service.test.ts`: `mapAuthError('auth/invalid-credential')` trả "Sai email hoặc mật khẩu."; `auth/email-already-in-use` trả "Email đã được đăng ký."; mã lạ trả thông báo mặc định; `loginUser('  A@B.com ', 'x')` gọi `signInWithEmailAndPassword` với `'a@b.com'`; `subscribeAuth` trả hàm hủy gọi `onAuthStateChanged`'s unsubscribe.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** theo Interfaces (chuẩn hóa email: `trim().toLowerCase()`). **Step 4: Run** → PASS.
- [ ] **Step 5: Verify + commit** `feat(services): firebase init and auth service`.

---

### Task 5: Màn hình Đăng nhập / Đăng ký

**Files:**
- Create: `src/features/auth/validation.ts`, `src/features/auth/validation.test.ts`, `src/features/auth/auth-context.tsx`, `src/features/auth/screens/login-screen.tsx`, `src/features/auth/screens/register-screen.tsx`

**Interfaces:**
- Consumes: `loginUser`, `registerUser`, `subscribeAuth`, `mapAuthError`.
- Produces: `validateRegister(v: {name; email; password; confirm}): Partial<Record<'name'|'email'|'password'|'confirm', string>>`; `validateLogin(v: {email; password})` tương tự; `AuthProvider`, `useAuth(): {user: AuthUser | null; initializing: boolean}`.

- [ ] **Step 1: Failing tests** `validation.test.ts`: tên rỗng → lỗi `name`; email không hợp lệ → lỗi `email`; mật khẩu 5 ký tự → lỗi `password` ("Mật khẩu tối thiểu 6 ký tự."); `confirm` khác `password` → lỗi `confirm`; hợp lệ → `{}`; email `' A@B.com '` hợp lệ.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `validation.ts`. **Step 4: Run** → PASS.
- [ ] **Step 5: Màn hình** dùng Paper (`TextInput mode="flat"` style `flatStyles.input`, `Button`, `HelperText`, `Snackbar`/`HelperText` cho lỗi đăng nhập "Sai email hoặc mật khẩu."), có nút `loading`/`disabled` khi đang gọi; `AuthProvider` dùng `subscribeAuth` trong `useEffect` có cleanup.
- [ ] **Step 6: Verify + commit** `feat(auth): login and register screens`.

---

### Task 6: Điều hướng

**Files:**
- Create: `src/navigation/types.ts`, `src/navigation/root-navigator.tsx`, `src/navigation/tab-navigator.tsx`, `src/features/{home,contacts,notifications,settings}/screens/*-screen.tsx` (khung rỗng tạm), `__tests__/navigation.test.tsx`
- Modify: `App.tsx` (`SafeAreaProvider > PaperProvider > AuthProvider > NavigationContainer theme={navigationTheme}`)

**Interfaces:**
- Produces: `RootStackParamList {Login; Register; Tabs; Chat: {peerId: string; peerName: string}}`, `TabParamList {Home; Contacts; Notifications; Settings}`; `RootNavigator` chọn nhóm màn hình theo `useAuth().user`.

- [ ] **Step 1: Failing test** render `RootNavigator` với `useAuth` mock: `user=null` thấy "Đăng nhập"; có user thấy thanh tab với 4 nhãn "Trò chuyện", "Danh bạ", "Thông báo", "Cài đặt".
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** tab bar dùng `BottomNavigation.Bar` của Paper qua prop `tabBar`; header không bóng (`headerShadowVisible: false`), `initializing` hiển thị `ActivityIndicator`. **Step 4: Run** → PASS.
- [ ] **Step 5: Verify + commit** `feat(nav): auth-gated stack and tabs`.

---

### Task 7: Hồ sơ người dùng, presence và Danh bạ

**Files:**
- Create: `src/services/user-service.ts`, `src/services/presence-service.ts`, `src/lib/format-time.ts`, `src/lib/format-time.test.ts`, `src/lib/filter-users.ts`, `src/lib/filter-users.test.ts`, `src/features/contacts/hooks/use-users.ts`, `src/features/contacts/screens/contacts-screen.tsx`
- Modify: `src/features/auth/auth-context.tsx` (gọi `startPresence(uid)` khi có user, cleanup)

**Interfaces:**
- Produces: `createUserProfile(uid: string, name: string): Promise<void>`; `subscribeUsers(myUid: string, cb: (users: UserProfile[]) => void): Unsubscribe` (loại bản thân, sắp theo tên); `subscribeUser(uid: string, cb: (u: UserProfile | null) => void): Unsubscribe`; `startPresence(uid: string): Unsubscribe` (nghe `.info/connected`, `onDisconnect`); `setOffline(uid: string): Promise<void>`; `formatTime(ms: number): string` ("HH:mm"); `formatDayLabel(ms: number, now: number): string` ("Hôm nay"/"Hôm qua"/"dd/mm/yyyy"); `formatLastSeen(lastSeen: number | undefined, now: number): string` ("Ngoại tuyến" nếu thiếu, "Hoạt động 5 phút trước", …); `filterUsers(users: UserProfile[], q: string): UserProfile[]` (không phân biệt hoa thường và dấu).

- [ ] **Step 1: Failing tests**: `formatTime(new Date(2026,9,28,9,5).getTime()) === '09:05'`; `formatDayLabel` trả đúng ba trường hợp; `formatLastSeen(undefined, now) === 'Ngoại tuyến'` và 5 phút trước; `filterUsers` khớp "nguyen" với "Nguyễn An", chuỗi rỗng trả tất cả.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** các hàm thuần. **Step 4: Run** → PASS.
- [ ] **Step 5: Test + implement `subscribeUsers`** với `onValue` mock: không có bản thân trong kết quả; gọi hàm hủy thì callback không còn được gọi.
- [ ] **Step 6: Màn Danh bạ**: Paper `Searchbar`, `FlatList` hàng gồm `Avatar.Text` + chấm online (màu `colors.online`) + tên + trạng thái; nhấn → `navigation.navigate('Chat', {peerId, peerName})`; trạng thái rỗng khi không có ai.
- [ ] **Step 7: Verify + commit** `feat(contacts): users list with realtime presence and search`.

---

### Task 8: Dịch vụ chat và logic thuần

**Files:**
- Create: `src/lib/chat-id.ts`, `src/lib/chat-id.test.ts`, `src/lib/messages.ts`, `src/lib/messages.test.ts`, `src/lib/maps.ts`, `src/lib/maps.test.ts`, `src/services/chat-service.ts`, `src/services/chat-service.test.ts`

**Interfaces:**
- Produces: `getChatId(a: string, b: string): string` (sắp xếp, nối `_`); `canSend(text: string): boolean`; `groupByDay(messages: ChatMessage[], now: number): Array<{type: 'day'; label: string; key: string} | {type: 'message'; message: ChatMessage}>`; `buildMapsUrl(lat: number, lng: number): string` (`https://www.google.com/maps/search/?api=1&query=lat,lng`); trong `chat-service.ts`: `type Party = {uid: string; name: string}`; `sendTextMessage(me: Party, peer: Party, text: string): Promise<void>`; `sendLocationMessage(me: Party, peer: Party, coords: {lat: number; lng: number}): Promise<void>`; `subscribeMessages(chatId: string, limit: number, cb: (m: ChatMessage[]) => void): Unsubscribe`; `loadOlderMessages(chatId: string, beforeCreatedAt: number, limit: number): Promise<ChatMessage[]>`; `subscribeConversations(uid: string, cb: (c: ConversationSummary[]) => void): Unsubscribe` (sắp `lastAt` giảm dần); `markRead(uid: string, peerId: string): Promise<void>`.

- [ ] **Step 1: Failing tests**: `getChatId('b','a') === getChatId('a','b') === 'a_b'`; `canSend('  \n')` false, `canSend(' hi ')` true; `buildMapsUrl(21.0285, 105.8542)` chứa `query=21.0285,105.8542`; `groupByDay` chèn nhãn ngày khi đổi ngày; `sendTextMessage` gọi `update` một lần với các khóa `chats/{chatId}/messages/{id}`, `userChats/{me}/{peer}`, `userChats/{peer}/{me}` rồi `runTransaction` tăng `unread` người nhận; `sendTextMessage` với text rỗng ném lỗi/không gọi Firebase; `subscribeConversations` trả danh sách mới nhất trước; `markRead` đặt `unread` về 0.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (`serverTimestamp()` cho `createdAt`; tin nhắn dùng `push().key` làm id). **Step 4: Run** → PASS.
- [ ] **Step 5: Verify + commit** `feat(chat): chat service and pure helpers`.

---

### Task 9: Màn hình Chat (tin thường)

**Files:**
- Create: `src/features/chat/hooks/use-messages.ts`, `src/features/chat/hooks/use-peer.ts`, `src/features/chat/components/message-bubble.tsx`, `src/features/chat/components/message-input.tsx`, `src/features/chat/screens/chat-screen.tsx`, `src/features/chat/hooks/use-messages.test.tsx`

**Interfaces:**
- Consumes: `subscribeMessages`, `loadOlderMessages`, `subscribeUser`, `sendTextMessage`, `markRead`, `canSend`, `groupByDay`, `formatTime`, `formatLastSeen`.
- Produces: `useMessages(chatId: string, myUid: string, peerId: string): {items: ReturnType<typeof groupByDay>; loadOlder: () => Promise<void>; send: (text: string) => Promise<void>}` (tin gửi hiện ngay `pending`, lỗi thì `failed` kèm gửi lại).

- [ ] **Step 1: Failing test** `use-messages.test.tsx`: mount → có đúng 1 listener; unmount → hàm hủy được gọi đúng 1 lần; sau unmount callback gọi lại không đổi state; remount hai lần liên tiếp không nhân đôi tin.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** hooks (hủy listener trong cleanup; `markRead` khi mở và khi có tin mới đến lúc đang mở).
- [ ] **Step 4: Màn hình**: header qua `navigation.setOptions` hoặc `Appbar.Header` hiển thị tên + "Đang hoạt động"/`formatLastSeen`; bong bóng của mình bên phải (`bubbleMine`), người kia bên trái, giờ nhỏ trong bong bóng; `FlatList` có `maintainVisibleContentPosition`/`onEndReached` nạp tin cũ, tự cuộn xuống cuối khi có tin mới và người dùng đang ở cuối; ô nhập tự giãn tối đa 4 dòng, nút gửi `disabled` khi `!canSend`.
- [ ] **Step 5: Verify + commit** `feat(chat): realtime 1-1 chat screen`.

---

### Task 10: Gửi vị trí

**Files:**
- Create: `src/services/location-service.ts`, `src/services/location-service.test.ts`, `src/features/chat/components/location-bubble.tsx`
- Modify: `src/features/chat/components/message-input.tsx`, `src/features/chat/components/message-bubble.tsx`, `src/features/chat/screens/chat-screen.tsx`, `android/app/src/main/AndroidManifest.xml` (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`)

**Interfaces:**
- Produces: `class LocationPermissionError extends Error`; `getCurrentCoords(): Promise<{lat: number; lng: number}>` (xin quyền Android bằng `PermissionsAndroid`, ném `LocationPermissionError` nếu bị từ chối, ném lỗi thường nếu GPS lỗi/timeout).

- [ ] **Step 1: Failing tests**: quyền `denied` → ném `LocationPermissionError`; quyền `granted` + Geolocation mock trả `{coords:{latitude:21.03,longitude:105.85}}` → `{lat:21.03,lng:105.85}`; Geolocation lỗi → ném lỗi thường.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: UI**: nút `IconButton` 📍 (icon `place`) trong thanh nhập; từ chối quyền → `Snackbar` "Cần cấp quyền vị trí để gửi vị trí."; lỗi khác → "Không lấy được vị trí."; `LocationBubble` là thẻ riêng (icon `place` + "Vị trí của tôi" + tọa độ), nhấn gọi `Linking.openURL(buildMapsUrl(lat,lng))`.
- [ ] **Step 6: Verify + commit** `feat(chat): send and open location messages`.

---

### Task 11: Home

**Files:**
- Create: `src/features/home/hooks/use-conversations.ts`, `src/features/home/hooks/use-conversations.test.tsx`, `src/features/home/screens/home-screen.tsx`
- Modify: `src/navigation/tab-navigator.tsx` (badge tổng `unread` trên tab Trò chuyện)

**Interfaces:**
- Consumes: `subscribeConversations`, `formatTime`/`formatDayLabel`.
- Produces: `useConversations(uid: string): {conversations: ConversationSummary[]; totalUnread: number}`.

- [ ] **Step 1: Failing test**: mount/unmount hủy listener đúng một lần; `totalUnread` là tổng `unread`; cập nhật callback với `unread` tăng thì giá trị tăng ngay; `unread` về 0 sau khi `markRead` (mock) được phản ánh.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.**
- [ ] **Step 4: Màn hình**: hàng gồm `Avatar.Text` (màu theo hash `peerId`), tên, tin cuối (hiển thị "📍 Vị trí" khi `lastType === 'location'`), giờ, `Badge` số chưa đọc (đậm khi > 0); mới nhất trên cùng; nhấn → Chat; trạng thái rỗng.
- [ ] **Step 5: Verify + commit** `feat(home): conversation list with unread badges`.

---

### Task 12: Thông báo và Cài đặt

**Files:**
- Modify: `src/features/notifications/screens/notifications-screen.tsx`, `src/features/settings/screens/settings-screen.tsx`
- Test: `src/features/settings/screens/settings-screen.test.tsx`

**Interfaces:**
- Consumes: `logoutUser`, `useAuth`.

- [ ] **Step 1: Failing test**: nhấn "Đăng xuất" gọi `logoutUser` một lần; hiển thị tên và email người dùng.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement**: Cài đặt hiển thị thẻ tài khoản + nút Đăng xuất (có `Dialog` xác nhận của Paper); Thông báo là danh sách tĩnh 3–4 mục mẫu, có trạng thái rỗng.
- [ ] **Step 4: Verify + commit** `feat: notifications and settings screens`.

---

### Task 13: Hoàn thiện, kiểm chứng và tài liệu kiến trúc

**Files:**
- Create: `docs/architecture.md`
- Modify: `docs/danh-gia-de-bai.md`, `README.md`

- [ ] **Step 1: `grep` không còn** `firebase/` ngoài `src/services/` và test; không còn `fontWeight` và màu hex rải rác trong `src/features` (chỉ dùng token/theme).
- [ ] **Step 2: Chạy** `npm test`, `npx tsc --noEmit`, `npm run lint` — ghi kết quả thật vào README (số test).
- [ ] **Step 3: `docs/architecture.md`**: cây thư mục thực tế, quy tắc phụ thuộc, luồng gửi tin/unread/presence, các điểm giới hạn đã biết (iOS chưa làm font/quyền, gửi tin hai bước không nguyên tử).
- [ ] **Step 4: Cập nhật `danh-gia-de-bai.md`** trạng thái từng mục và danh sách việc người dùng phải làm (điền config Firebase, dán luật, chụp ảnh, quay video 2 máy ảo).
- [ ] **Step 5: Commit** `docs: architecture and requirement checklist`.
