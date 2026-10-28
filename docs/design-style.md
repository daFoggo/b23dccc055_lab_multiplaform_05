# Phong cách giao diện: React Native Paper (Material Design 3 Default) + Font Inter

Hệ thống giao diện của ChatApp sử dụng lõi gốc là **React Native Paper (Material Design 3)** kết hợp với bộ font **Inter**. Giao diện tuân thủ tuyệt đối quy tắc **Component Composition** của Material 3, kết hợp đa dạng các thành phần UI chuẩn mực theo đúng nhu cầu sử dụng thực tế.

---

## 1. Nguyên tắc cốt lõi

1. **Chuẩn Material Design 3 mặc định**:
   - Sử dụng theme gốc `MD3LightTheme` từ `react-native-paper`.
   - Giữ nguyên thang bo góc mặc định của Paper (`roundness = 4`), trong đó Button bo 20dp, Card bo 12dp, Searchbar/Pill bo 28dp, Dialog bo 28dp.
   - Bảng màu vai trò M3 chuẩn mực (`primary`: `#6750A4`, `background`: `#FFFBFE`, `surface`: `#FFFBFE`, `surfaceVariant`: `#E7E0EC`, `secondaryContainer`: `#E8DEF8`, v.v.).
   - Độ sâu và phân tầng giao diện sử dụng hệ thống `elevation` (level0 - level5) chính thức của Paper MD3 thay vì tắt bóng hoặc viền giả.

2. **Tuân thủ tuyệt đối Composition của Components**:
   - Sử dụng các sub-components chuẩn của Paper để cấu thành giao diện:
     - **Card**: Sử dụng `Card.Title`, `Card.Content`, `Card.Actions`.
     - **TextInput**: Sử dụng `mode="outlined"` với `TextInput.Icon` ở cả `left` và `right`, kết hợp `HelperText type="error"`.
     - **List**: Sử dụng `List.Section`, `List.Subheader`, `List.Item` với `left` (Avatar/Icon) và `right` (Badge/Meta/Icon), ngăn cách bởi `Divider`.
     - **Dialog**: Sử dụng `Dialog.Icon`, `Dialog.Title`, `Dialog.Content`, `Dialog.Actions`.
     - **Bottom Navigation**: Sử dụng `BottomNavigation.Bar` với `Badge` thông báo.
     - **Searchbar**: Sử dụng Paper `Searchbar` nguyên bản với `mode="bar"`.

3. **Đồng bộ Styling giữa Component Paper và Component tự tạo**:
   - Mọi thành phần (kể cả component đặc thù như `MessageBubble`, `LocationBubble`, `MessageInput`) đều lấy token màu và font trực tiếp từ `useTheme()`.
   - Tin nhắn của mình: Nền `theme.colors.primary`, chữ `theme.colors.onPrimary`.
   - Tin nhắn của bạn: Nền `theme.colors.surfaceVariant`, chữ `theme.colors.onSurfaceVariant`.
   - Tin nhắn lỗi: Nền `theme.colors.errorContainer`, chữ `theme.colors.onErrorContainer`.
   - Trạng thái online: Chấm xanh `#2E9D57` với viền trùng màu `theme.colors.background` / `theme.colors.surface`.

4. **Font Inter đồng bộ**:
   - Toàn bộ app sử dụng font Inter với 3 biến thể:
     - Regular (400): `Inter_18pt-Regular` cho body text, phụ đề, nội dung tin nhắn.
     - SemiBold (600): `Inter_18pt-SemiBold` cho tiêu đề, nhãn nút, tên người dùng.
     - Bold (700): `Inter_18pt-Bold` cho headline lớn, tiêu đề hội thoại chưa đọc.
   - Thiết lập `fontWeight: 'normal'` ở mọi cấp cấu hình để Android nhận diện đúng file font TTF mà không bị render mờ.

---

## 2. Bảng đối chiếu Components & Nơi áp dụng

| Thành phần Paper | Vai trò & Composition | Nơi áp dụng trong App |
|---|---|---|
| `Card` | `Card mode="elevated"` / `mode="contained"` với `Card.Title`, `Card.Content`, `Card.Actions` | Thẻ tài khoản Cài đặt, thẻ thông tin phiên bản, thẻ trạng thái rỗng Home |
| `TextInput` | `mode="outlined"` kết hợp `TextInput.Icon` (icon email, lock, eye) | Màn hình Đăng nhập, Đăng ký |
| `Button` | `mode="contained"`, `mode="outlined"`, `mode="text"`, `mode="contained-tonal"` kèm icon | Các nút đăng nhập, đăng ký, đăng xuất, mở Google Maps |
| `List.Item` & `Divider` | `List.Item` với `left` (Avatar/Icon), `right` (Badge/Time/Chevron), phân tách bằng `Divider` | Danh sách hội thoại Home, Danh bạ, Thông báo, Cài đặt |
| `Searchbar` | `mode="bar"` nguyên bản của Paper MD3 | Tìm kiếm Danh bạ |
| `Dialog` | `Dialog.Icon`, `Dialog.Title`, `Dialog.Content`, `Dialog.Actions` | Hộp thoại xác nhận đăng xuất |
| `Badge` | Huy hiệu số tin chưa đọc trên thanh tab và danh sách hội thoại | Tab Trò chuyện, hàng hội thoại Home |
| `Avatar.Text` / `Avatar.Icon` | Kích thước 40dp, 48dp, 56dp với bảng màu hash theo UID | Avatar danh bạ, avatar cuộc trò chuyện, avatar cài đặt |
| `Snackbar` | Thông báo nổi với action nút bấm | Báo lỗi GPS, báo cấp quyền vị trí, báo lỗi đăng xuất |
| `Surface` | `elevation={2}` tạo thanh nổi phía dưới màn hình | Thanh nhập tin nhắn Chat (`MessageInput`) |

---

## 3. Quản lý Icons (MaterialCommunityIcons)

- Tất cả icon đều lấy từ font `MaterialCommunityIcons` (chuẩn mặc định của Paper).
- Danh mục tên icon tập trung tại `src/theme/icons.ts`.
- Bộ kiểm thử tự động `src/lib/icons.test.ts` đảm bảo tất cả tên icon đều tồn tại 100% trong glyphmap của thư viện.
