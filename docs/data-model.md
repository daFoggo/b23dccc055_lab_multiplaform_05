# Mô hình dữ liệu Realtime Database

```
users/{uid}                    { name, online, lastSeen }   // không lưu email (tránh lộ PII)
chats/{chatId}/messages/{id}   { senderId, type: 'text'|'location', text?, lat?, lng?, createdAt }
userChats/{uid}/{peerUid}      { peerName, lastMessage, lastType, lastAt, unread }
```

- `chatId` = hai uid sắp xếp rồi nối bằng `_`.
- Luật nằm ở `docs/firebase-rules.json` (JSON thuần, không chú thích).

## Quy tắc chính

| Nút | Đọc | Ghi | Validate |
|---|---|---|---|
| `users` | mọi người dùng đã đăng nhập | chỉ chủ `$uid` | `name` string 1..50, `online` boolean, `lastSeen` number; khóa lạ bị chặn |
| `chats/$chatId` | chỉ hai uid trong `chatId` | chỉ hai uid đó, và chỉ khi `!data.exists()` (tin bất biến: tạo được, không sửa/xóa) | `senderId === auth.uid`; `type` text hoặc location; `text` string 1..2000; `lat` -90..90, `lng` -180..180 (number); `createdAt` number và `<= now`; khóa lạ bị chặn; text/lat/lng khớp với `type` |
| `userChats/$uid/$peer` | chỉ `$uid` | `$uid` hoặc `$peer` | đủ 5 khóa; `peerName` phải bằng `users/$peer/name`; `lastMessage` <= 200; `lastType` text/location; `lastAt` number; `unread` số nguyên 0..100000; khóa lạ bị chặn |

Ghi chú: `.indexOn: ["createdAt"]` đặt tại `messages`. Kiểm tra thành viên dùng `beginsWith(uid + '_')` hoặc `endsWith('_' + uid)` thay vì `contains` để không khớp chuỗi con. "createdAt là timestamp máy chủ" chỉ ép được ở mức số và không ở tương lai (`<= now`); client dùng `serverTimestamp()`.

Hệ quả cho code: `users/$uid` phải được ghi trước khi có `userChats` liên quan (vì `peerName` đối chiếu `users/$peer/name`); `text` rỗng bị luật từ chối (client đã chặn tin rỗng).

## Tự đánh giá theo checklist `firebase-security-rules-auditor`

Đây là tự chấm của người viết luật, chưa chạy trên Emulator hay Console (chưa chứng minh bằng thử nghiệm). Skill viết cho Firestore; áp dụng tương đương cho RTDB.

**Điểm: 4/5.** Không có rò rỉ dữ liệu hay leo thang đặc quyền đã biết; còn rủi ro toàn vẹn dữ liệu giữa hai người trong cuộc trò chuyện.

| Mục checklist | Kết quả |
|---|---|
| Update bypass | Tin nhắn: `.write` chỉ khi `!data.exists()` nên không thể tạo hợp lệ rồi sửa thành sai; xóa cũng bị chặn. `users` và `userChats`: validate chạy trên dữ liệu mới ở cả tạo lẫn sửa (cùng một `.validate`), không có đường tạo/sửa lệch nhau. |
| Nguồn thẩm quyền | Quyền dựa vào `auth.uid` và `$chatId`/`$uid`/`$peer` trên đường dẫn, không dựa dữ liệu client gửi. `senderId` ép bằng `auth.uid`; `peerName` đối chiếu với `users/$peer/name` thay vì tin client. |
| Kiểu dữ liệu | Mọi trường có `isString/isNumber/isBoolean`; `unread` kiểm số nguyên; khóa lạ bị `$other: false`. |
| Giới hạn kích thước | `name` <= 50, `text` <= 2000, `lastMessage` <= 200, `unread` <= 100000. Không có giới hạn số tin/số mục. |
| Field-level vs identity-level | Ghi `userChats/$uid/$peer` do `$peer` thực hiện có kiểm tra danh tính (`auth.uid === $peer`), không phải "ai cũng ghi được". Nhưng danh tính `$peer` không đảm bảo có cuộc trò chuyện thật (xem bên dưới). |

### Phát hiện và rủi ro còn lại

1. **(Minor/Moderate) `$peer` có thể sửa `unread` của người nhận về bất kỳ giá trị hợp lệ** (làm tăng ảo hoặc xóa chưa đọc của người kia), vì luật không ràng buộc `unread` chỉ tăng 1 khi kèm tin mới. RTDB khó ràng buộc quan hệ giữa hai nút khác nhau trong một multi-path update.
2. **(Minor) `$peer` có thể ghi đè `lastMessage`, `lastType`, `lastAt` trong Home của người nhận mà không gửi tin thật** (giả xem trước). `peerName` thì đã được kiểm tra nên không giả được tên.
3. **(Minor/Moderate) Spam**: bất kỳ người dùng đăng nhập nào cũng ghi được `userChats/{nạn nhân}/{uid của mình}` và tạo tin trong `chats/{uidA}_{uidB}` với một uid bất kỳ, nên có thể đẩy mục lạ vào Home của người khác. Luật không kiểm tra hai người đã "kết nối". Không có rate limit.
4. **(Minor) Không giới hạn tổng số tin/mục** (Resource Exhaustion): mỗi tin <= 2000 ký tự nhưng số lượng không bị chặn.
5. **(Minor) `createdAt` chỉ kiểm tra `number` và `<= now`**: client có thể đặt thời điểm quá khứ tùy ý (sắp xếp sai), vì RTDB không phân biệt được giá trị đến từ `serverTimestamp()`.
6. **(Info) `users` đọc được bởi mọi người dùng đã đăng nhập** (cần cho Danh bạ); chỉ chứa `name`, `online`, `lastSeen`, không có email nên không lộ PII đáng kể. Chủ tài khoản có thể xóa nút `users/$uid` của mình (không validate khi xóa).
7. **(Info) `peerName` phụ thuộc `users/$peer/name`**: nếu sau này cho đổi tên, các mục `userChats` cũ chỉ cập nhật khi được ghi lại.

Khuyến nghị nếu cần chặt hơn: chuyển phần cập nhật `userChats` của người nhận sang Cloud Functions (Admin SDK) và chỉ cho `$uid` ghi; thêm Cloud Functions/App Check để chống spam.
