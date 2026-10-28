# Bàn giao ChatApp (Bài thực hành 5) – trạng thái 2026-10-28

Nhánh `feat/chat-realtime` (29 commit, chưa merge vào `main`). Thư mục: `D:\Dev_Projects\b23dccc055_lab_multi_platform`.
Thiết kế: `docs/superpowers/specs/2026-10-28-chat-realtime-design.md`. Plan: `docs/superpowers/plans/2026-10-28-chat-realtime.md` (13 task).
Sổ theo dõi quy trình (git-ignore, chỉ có trên máy): `.superpowers/sdd/2026-10-28-chat-realtime/progress.md`; báo cáo từng task `task-N-report.md` cùng thư mục.

## 1. Đã làm xong (code + test, mỗi task đã qua review độc lập)

| Task | Nội dung | Commit cuối |
| --- | --- | --- |
| 1 | Tách base RN CLI từ MidTermTest, đổi tên ChatApp / `com.chatapp` | 7c86f64 |
| 2 | Docs gốc: de-bai, danh-gia, data-model, firebase-rules.json, firebase-setup, README | c61416a |
| 3 | Theme Paper MD3 + style phẳng (`src/theme`) | ad1fd95 |
| 4 | Firebase init, auth-service, user/presence service | 911db14 |
| 5 | Màn Đăng nhập / Đăng ký + AuthProvider | 953e5d4 |
| 6 | Điều hướng (stack + tab Paper BottomNavigation.Bar) | 33cceba |
| 7 | Danh bạ + presence online/offline realtime + tìm kiếm | daed842 |
| 8 | chat-service + logic thuần (chatId, groupByDay, maps…) | db01386 |
| 9 / 9b | Màn Chat (optimistic theo id, phân trang, markRead) + sửa font icon MaterialCommunityIcons | 8b52097 / 4892b67 |
| 10 | Gửi vị trí + bong bóng vị trí mở Google Maps | 14efe2a |
| 11 | Home (danh sách hội thoại, badge chưa đọc dùng chung qua `ConversationsProvider`) | e02828d |
| 12 | Thông báo (danh sách tĩnh) + Cài đặt (đăng xuất có Dialog) | 42afe85 |
| 13a | Dọn các lỗi nhỏ tồn đọng (quyền vị trí xấp xỉ Android 12, a11y Home, thông báo lỗi Firebase) | 00779d9 |
| sau đó | `firebase.json`/`.firebaserc`; tên người dùng lấy từ `users/{uid}/name`; Dialog bo 24 | 315e83d, eeaf3fd |

Kiểm tra gần nhất (trên nhánh này): `npx jest` 33 suite / 207 test xanh, `npx tsc --noEmit` sạch, `npx eslint .` sạch. Jest có cảnh báo "worker failed to exit gracefully" (có timer chưa dọn, xem mục 5).

## 2. Còn dở

- **Task 13** (chưa làm): `docs/architecture.md`; cập nhật `docs/danh-gia-de-bai.md` (đang để "chưa làm" cho mọi mục); sửa README cho khớp thực tế (số test, danh sách tính năng đang ghi "mục tiêu"); sửa nhắc `MaterialIcons` trong `docs/material-3.md` và spec (nay là MaterialCommunityIcons); kiểm `grep` không còn `firebase/` ngoài `src/services/`.
- **Review toàn nhánh** (chưa làm): một reviewer mạnh đọc cả nhánh so với spec (xem "Review Focus" đầu plan).
- **Kiểm thử end-to-end trên máy ảo** (chưa làm hết, xem mục 4).
- Chưa merge, chưa tạo PR.

## 3. Firebase (project `lab-realtime-chat-24243`)

- Web app `ChatApp` đã tạo; cấu hình (công khai) nằm trong `src/services/firebase-config.ts`.
- Authentication → Email/Password: **đã bật** (người dùng đã bật).
- Realtime Database `…asia-southeast1…`: **luật đã triển khai** từ `docs/firebase-rules.json` bằng `firebase deploy --only database` (Firebase CLI 15.34.1 đã cài global, đã đăng nhập).
- Đã có 2 tài khoản thử `user1@gmail.com` (User 1) và `user2@gmail.com` (User 2). Mật khẩu ở `.superpowers/test-accounts.md` (git-ignore). Tài khoản được đăng ký qua chính app trên máy ảo.
- Không dùng và không được đưa vào repo: service account / `firebase-admin`.

## 4. Đã xác nhận trên máy ảo `Medium_Phone_API_37.0` (emulator-5554)

Đã thấy chạy thật: đăng ký (kể cả cơ chế rollback khi luật chặn ghi hồ sơ), tự đăng nhập lại sau khi mở lại app (persistence), danh bạ lấy `users` từ Firebase và hiện trạng thái hoạt động, màn Cài đặt hiện đúng tên (`users/{uid}/name`), icon hiển thị đúng sau khi nạp font MaterialCommunityIcons.

**Chưa kiểm chứng trên máy thật/ảo** (cần làm trước khi coi là hoàn chỉnh):
1. Gửi/nhận tin thường giữa 2 người, tin hiện ngay, trái/phải, giờ, tự cuộn xuống (cần 2 thiết bị hoặc 2 AVD; máy này chỉ có 1 AVD, clone thêm bằng `avdmanager`).
2. Số chưa đọc tăng ở Home/tab và về 0 khi mở hội thoại; luật bảo mật có chặn bước ghi `userChats` nào không (đây là rủi ro lớn nhất: luật chưa từng chạy với dữ liệu chat thật).
3. Gửi vị trí: hộp thoại quyền, từ chối → Snackbar, bong bóng vị trí mở Google Maps; emulator cần đặt vị trí giả (Extended controls → Location).
4. Bàn phím + inset trên Android edge-to-edge ở màn Chat (đã có điểm cần xem: `keyboardVerticalOffset = headerHeight`).
5. Trạng thái online/offline cập nhật khi người kia thoát app / mất mạng (`onDisconnect`).
6. Hình dạng Dialog sau sửa bo góc (trước đó quá tròn vì Paper nhân `roundness` ×7; đã đặt `flatStyles.dialog` bo 24, chưa nhìn lại trên máy).
7. Ảnh nộp bài: Đăng ký, Home có chưa đọc, Danh bạ có online, Chat có tin thường + vị trí, ảnh Firebase Console tab Data, video 1–2 phút 2 máy.

## 5. Vấn đề đã biết / còn lỏng

- Gửi tin gồm 2 bước không nguyên tử (multi-path update rồi transaction tăng `unread`); nếu bước 2 lỗi thì lệch số chưa đọc (đã ghi trong docs).
- Luật còn rủi ro đã ghi ở `docs/data-model.md` (điểm tự chấm 4/5): peer có thể sửa `unread`/`lastMessage` của node mình.
- `markRead` đọc rồi ghi, có thể ghi đè một tin đến đúng lúc.
- Timer/interval chưa dọn gây cảnh báo jest worker (60 giây tick trong Home/Danh bạ?): kiểm tra `--detectOpenHandles`.
- Sắp xếp tiếng Việt `localeCompare('vi')` và chữ Đ chưa kiểm trên Hermes thật.
- iOS: chưa làm font Inter, chưa thử build, chưa kiểm font icon/quyền vị trí (chỉ Android).
- Màn Thông báo là danh sách tĩnh do không có tài liệu Bài 4.
- `docs/design-style.md` còn ghi chú iOS font; spec/`material-3.md` còn nhắc MaterialIcons.

## 6. Chạy lại môi trường

```bash
npm install
npx react-native start                      # Metro, cổng 8081
adb reverse tcp:8081 tcp:8081
cd android && .\gradlew.bat app:installDebug -PreactNativeDevServerPort=8081   # chạy bằng cmd/PowerShell; Git Bash không tìm thấy gradlew.bat
```

Lúc bàn giao: Metro đang chạy ở cổng 8081 và emulator đang mở, app đã cài và đang đăng nhập `user2`. Chụp màn hình: `adb exec-out screencap -p > x.png`. Mở/đăng ký bằng `adb shell input` nếu cần.

## 7. Quy ước đã chốt

- Paper là lõi UI; **không** tạo component tự dựng (ngoại lệ: bong bóng tin nhắn, ô nhập tin, bong bóng vị trí). Mọi tinh chỉnh phẳng ở `src/theme` (`paper-theme.ts`, `component-styles.ts`); không hex ngoài `src/theme`.
- Icon: MaterialCommunityIcons qua `src/theme/icons.ts` (có test đối chiếu glyphmap).
- Firebase chỉ trong `src/services/`; mọi `useEffect` có listener đều trả hàm hủy.
- Mỗi task: TDD, commit riêng, `npm test` + `tsc` + `eslint` xanh. Quy trình dùng skill superpowers (subagent-driven); phần việc còn lại có thể làm trực tiếp.
- Kỹ năng Firebase đã cài trong `.claude/skills/` (không commit): firebase-basics, firebase-auth-basics, firebase-security-rules-auditor.
