# Material Design 3 - Components cho ứng dụng task-planner (React Native, không dùng UI library)

Tài liệu này tổng hợp thông số và nguyên tắc của các component M3 từ trang m3.material.io, dùng để tự dựng bằng `Pressable` + `StyleSheet`.

## Phạm vi đọc và giới hạn

- Nguồn: trang overview, specs, guidelines của từng component (đã đọc qua browser, nội dung render bằng JavaScript).
- **Opacity của state layer (hover, focus, pressed, dragged, disabled)**: không đọc được. Bảng token không hiện trong text của trang. Không có giá trị nào được điền từ bộ nhớ.
- **Số đo nằm trong hình ảnh** (diagram): một số giá trị không có trong text, được ghi là "không đọc được" ở từng mục.
- **Empty states**: không đọc được. Các đường dẫn thử (`/foundations/empty-states`, `/components/empty-states/overview`, và các biến thể khác) đều trả về trang không tìm thấy, và trang index `/components` không có liên kết tới nó.
- **Top app bar**: trang M3 dùng slug `/components/app-bars/`. Slug `/components/top-app-bar/` không mở được. Bản Expressive đã đổi tên thành "app bar".
- Các bản cập nhật "M3 Expressive" được ghi riêng, vì đây là phần mở rộng sau này. Nếu muốn bám bản M3 gốc thì bỏ qua các mục này.
- Đơn vị: dp. Trong React Native, 1 dp tương ứng 1 đơn vị layout, nên dùng trực tiếp số dp.

---

## 1. Buttons

**Khi nào dùng**: thể hiện hành động người dùng có thể làm. Thường đặt trong dialog, form, card, toolbar.

**Nguyên tắc chung**
- Không đặt quá nhiều button. Hành động ít ưu tiên đưa vào overflow menu hoặc icon button.
- Thứ tự nhấn mạnh, cao đến thấp: elevated, filled, tonal, outlined, text. Filled nên xuất hiện tối đa một lần mỗi màn hình, cho hành động cuối như Save hoặc Confirm.
- Nhãn ngắn (khoảng 1 đến 3 từ), sentence case, một dòng, không cắt.
- Icon đặt bên trái (đảo khi RTL). Không dùng hai icon.

**Các style (color configurations)**
- Elevated: nền surface container low, chữ primary, có bóng đổ (elevation mặc định 1, bằng 0 khi disabled).
- Filled: nền primary, chữ on primary.
- Tonal: nền secondary container, chữ on secondary container.
- Outlined: viền outline variant, chữ on surface variant. Nền trong suốt khi nghỉ.
- Text: chữ primary, không có nền khi nghỉ. Không gạch chân.
- Toggle (Expressive): không có toggle text button.

**Kích thước và số đo (text)**
- Chiều cao mặc định (S): 40dp, bo tròn hoàn toàn (full rounding). M2 là 36dp.
- Icon: 20dp (chuẩn mới).
- Padding ngang của size S: 16dp (khuyến nghị Expressive; 24dp không còn được khuyến nghị).
- Bảng padding và kích thước cho XS, S, M, L, XL có trong hình, không đọc được dạng text.
- Corner radius khi là hình vuông (square): XS và S 12dp, M 16dp, L và XL 28dp. Khi pressed: XS và S 8dp, M 12dp, L và XL 16dp.
- Target tối thiểu 48x48dp. Icon button XS và S cần vùng chạm tối thiểu 48x48dp.

**Trạng thái**: enabled, disabled, hovered, focused, pressed. Riêng button có thể morph sang hình vuông hơn khi pressed.
- Opacity của state layer: không đọc được.

**Do / Don't**
- Do: dùng filled cho hành động chính, một cái duy nhất trên màn hình.
- Do: đặt text button ở cạnh phải trong dialog.
- Don't: dùng outlined hoặc text trên ảnh hoặc video.
- Don't: gạch chân text button, bọc nhãn thành nhiều dòng.

**Áp dụng cho React Native**
Dùng `Pressable` làm container. Đặt `height: 40`, `borderRadius: 999` (full), `paddingHorizontal: 16`, `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'center'`. Màu nền và màu chữ lấy từ bảng color role ở trên, dùng một object token để chọn theo style.

Lớp state layer: thêm một `View` `position: 'absolute'`, phủ đầy container, với `backgroundColor` là màu chữ của style, và `opacity` đổi theo `pressed`/`hovered`. Giá trị opacity phải tự chọn và ghi rõ là ước lượng, vì không đọc được từ nguồn. Trên Android có thể dùng `android_ripple` của `Pressable` để có ripple.

Bắt buộc có `hitSlop` để đạt vùng chạm 48dp khi button nhỏ hơn. Dùng `disabled` của `Pressable` và đổi màu theo đó. Morph hình dạng khi pressed có thể làm bằng `Animated` đổi `borderRadius`, nhưng đây là tùy chọn.

**Nguồn**: https://m3.material.io/components/buttons/overview ; /specs ; /guidelines

---

## 2. Chips

**Khi nào dùng**: giúp người dùng nhập liệu, chọn, lọc, hoặc chạy hành động gợi ý. Không dùng để thay cho button của bước tiếp theo.

**Các loại (variant)**

| Variant | Dùng cho |
|---|---|
| Assist | Hành động thông minh hoặc tự động. Nhãn bắt đầu bằng động từ. |
| Filter | Lọc tập dữ liệu. Nhãn là danh từ, không phủ định. Khi chọn có checkmark đầu. |
| Input | Thông tin người dùng nhập, có nút xóa ở cuối (bắt buộc). Có thể sửa, sắp xếp lại. |
| Suggestion | Gợi ý do sản phẩm tạo ra, ví dụ quick reply. |

**Nguyên tắc**
- Luôn dùng theo nhóm, không dùng một chip đứng riêng. Nhóm có thể cuộn ngang.
- Không trộn hành vi chọn một và chọn nhiều trong cùng một màn hình.
- Nhãn tối đa 20 ký tự.
- Khoảng cách tối thiểu giữa chip: 8dp.

**Số đo (text, giống nhau cho cả bốn variant)**
- Chiều cao: 32dp.
- Corner radius: 8dp.
- Icon: 18dp.
- Padding ngang: 16dp (không icon), 8dp (có icon).
- Khoảng cách giữa các phần tử bên trong: 8dp.
- Target tối thiểu: 48dp. Nút xóa phụ cần vùng 48x48dp.
- Input chip có avatar: kích thước 24dp, bo góc 12dp, padding trái 4dp, padding phải 8dp.

**Màu**
- Assist: nền surface container low (tùy chọn), chữ on surface, viền outline, icon primary.
- Filter: viền outline variant, khi chọn nền secondary container, chữ on secondary container.
- Input: viền outline variant, khi chọn nền secondary container, chữ on secondary container.
- Suggestion: viền outline, nền surface container low, chữ on surface variant.

**Trạng thái**: enabled, disabled, hovered, focused, pressed (ripple), dragged. Elevation mặc định 0. Không dùng elevation để thể hiện pressed.
- Opacity của state layer: không đọc được.

**Do / Don't**
- Do: dùng elevation chỉ khi chip nằm trên ảnh hoặc nền phức tạp.
- Don't: dùng filter chip chỉ có một lựa chọn; hãy xuống dòng hoặc cuộn ngang.

**Áp dụng cho React Native**
Container là `Pressable` với `height: 32`, `borderRadius: 8`, `borderWidth: 1`, `paddingHorizontal: 16` (hoặc 8 khi có icon), `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 8`. Với filter chip đã chọn, đổi `backgroundColor` sang secondary container và thêm checkmark. Bọc cả nhóm trong `ScrollView horizontal` hoặc `flexWrap: 'wrap'`. Đảm bảo `hitSlop` để đạt 48dp chiều cao chạm.

**Nguồn**: https://m3.material.io/components/chips/overview ; /specs ; /guidelines

---

## 3. Cards

**Khi nào dùng**: hiển thị nội dung và hành động cho một chủ đề. Dùng khi có phân cấp rõ ràng, dễ quét.

**Các variant**: elevated (có bóng), filled (ít nhấn mạnh nhất, tách bằng nền), outlined (có viền rõ). Ba loại có cùng chức năng, chỉ khác phong cách.

**Cấu trúc (anatomy)**: container (bắt buộc), image, button, supporting text, subhead, headline. Có thể có thumbnail, video, divider, overflow menu (góc trên hoặc dưới bên phải).

**Số đo (text)**
- Corner radius: 12dp.
- Padding ngang: 16dp.
- Khoảng cách giữa các card: tối đa 8dp.
- Chữ căn trái.

**Màu**
- Elevated: nền surface container low.
- Filled: nền surface container highest.
- Outlined: nền surface, viền outline variant.

**Trạng thái**: hovered, focused, pressed, dragged, disabled. Khi được nhấc lên (pick up) thì tăng elevation.
- Opacity: không đọc được.

**Do / Don't**
- Do: dùng tối đa một swipe action cho mỗi card.
- Don't: cuộn nội dung bên trong card trên mobile.
- Don't: đặt chữ hoặc icon lên ảnh mà không có scrim.
- Trên màn hình nhỏ, cân nhắc đổi card thành list.

**Áp dụng cho React Native**
Dùng `View` (không cần `Pressable` nếu card tĩnh; dùng `Pressable` nếu cả card bấm được). `borderRadius: 12`, `padding: 16`. Elevated: `shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset` trên iOS và `elevation` trên Android. Filled: `backgroundColor` là surface container highest. Outlined: `borderWidth: 1` với màu outline variant. Giá trị bóng cụ thể không có trong nguồn, nên tự chọn và ghi rõ là ước lượng.

**Nguồn**: https://m3.material.io/components/cards/overview ; /specs ; /guidelines

---

## 4. Text fields

**Khi nào dùng**: người dùng cần nhập văn bản. Mọi field phải có label.

**Các variant**: filled và outlined, chức năng như nhau. Không trộn hai loại trong cùng một form hoặc vùng.

**Nguyên tắc**
- Label luôn hiển thị. Khi focus, label chuyển từ giữa lên trên. Không cắt, không xuống dòng.
- Field bắt buộc: dấu sao cạnh label, giải thích ở đầu form.
- Supporting text: nên một dòng. Có giới hạn ký tự thì thêm bộ đếm.
- Khi lỗi, error text thay thế supporting text để layout không nhảy. Nên có icon lỗi làm chỉ báo thứ hai. Mô tả cách sửa lỗi.
- Field một dòng cuộn ngang. Field nhiều dòng tự mở rộng. Text area có chiều cao cố định.
- Prefix và suffix được hỗ trợ.
- Field chỉ đọc (read-only) vẫn có kiểu như bình thường nhưng ghi rõ là chỉ đọc.

**Số đo (text)**

| Thuộc tính | Filled | Outlined |
|---|---|---|
| Chiều cao container | 56dp | 56dp |
| Padding ngang (không icon) | 16dp | 16dp |
| Padding ngang (có icon) | 12dp | 12dp |
| Khoảng cách icon và chữ | 16dp | 16dp |
| Khoảng cách trên supporting text | 4dp | 4dp |
| Target | 56dp | 56dp |

- Filled có padding trên và dưới 8dp, label căn giữa khi chưa có giá trị.
- Outlined có padding ngang 4dp khi label đã có giá trị.
- Corner radius: outlined bo tròn toàn bộ. Filled bo góc trên, góc dưới vuông. Số cụ thể không có trong text: không đọc được.

**Màu**
- Filled: nền surface container highest, label on surface variant, active indicator primary, chữ on surface.
- Outlined: viền outline, label on surface variant, focus viền primary, chữ on surface.

**Trạng thái**: enabled, focused, hovered, disabled, mỗi trạng thái có cả khi rỗng và khi có giá trị. Trạng thái error có viền và supporting text màu lỗi.
- Opacity: không đọc được.

**Do / Don't**
- Don't: giảm density làm target dưới 48dp.
- Don't: để label bị cắt hoặc xuống dòng.

**Áp dụng cho React Native**
Dùng `TextInput` bọc trong `View`. Container có `height: 56`, `borderRadius` (outlined) hoặc `borderTopLeftRadius`/`borderTopRightRadius` (filled), `paddingHorizontal: 16`. Label là `Text` tuyệt đối, dịch chuyển bằng `Animated` từ giữa lên trên khi `isFocused` hoặc có giá trị. Supporting text là `Text` nằm dưới container, đổi màu sang lỗi khi có `error`. Dùng `onFocus`/`onBlur` để quản lý trạng thái focus. Không dùng `placeholder` làm label.

**Nguồn**: https://m3.material.io/components/text-fields/overview ; /specs ; /guidelines

---

## 5. Lists

**Khi nào dùng**: nhóm dọc các mục gồm chữ, icon, ảnh, hoặc hành động. Tối ưu cho đọc.

**Cấu trúc (anatomy)**: container và label là bắt buộc. Tùy chọn: overline, trailing text, supporting text, trailing icon, divider, leading avatar, leading icon, leading media.

**Nguyên tắc**
- Giữ vị trí nhất quán cho visual và primary text. Supporting text 1 đến 3 dòng.
- Một kiểu tương tác chọn cho mỗi mục. Checkbox để chọn nhiều, switch để bật tắt, radio để chọn một.
- Chế độ chọn một: không có hành động phụ, không có checkbox. Chế độ chọn nhiều: có checkbox hoặc switch, không có radio, không có hành động phụ.
- Danh sách có khung (contained) dùng khoảng cách. Danh sách không khung dùng divider.
- Trên màn hình rộng, dùng list-detail.
- Số ký tự mỗi dòng: 40 đến 60, tối đa 120 trên màn hình lớn.

**Số đo (text)**
- Chiều cao mục: 56dp, 72dp, hoặc 88dp, tùy phần tử cao nhất.
- Căn giữa theo chiều dọc; với mục từ 88dp trở lên hoặc có ba dòng trở lên thì căn trên.
- Padding trái của label: 16dp. Padding trái của leading element: 16dp.
- Padding trên của leading icon: 8dp (12dp khi mục từ 88dp trở lên).
- Trailing element: padding trái 16dp, phải 24dp.
- Divider: không padding trên và dưới. Inset divider: 16dp trái và 24dp phải.
- Target: 48dp.
- Chiều cao theo số dòng chi tiết: một phần nằm trong hình, không đọc được.

**Màu**: surface, on surface, on surface variant, outline variant (divider), primary container và on primary container (mục đang chọn).

**Trạng thái**: enabled, disabled, hovered, focused, pressed, dragged, mỗi trạng thái có mặc định và selected.
- Opacity: không đọc được.

**Lưu ý Expressive**: có variant list mới, khuyến nghị cho thiết kế mới. Bản baseline không được khuyến nghị.

**Do / Don't**
- Don't: dùng nhiều kiểu tương tác trên một mục.
- Don't: dùng divider cho danh sách có khung.

**Áp dụng cho React Native**
Dùng `FlatList` (hoặc `SectionList`) với `renderItem` trả về một `Pressable` có `minHeight: 56`, `flexDirection: 'row'`, `alignItems: 'center'`, `paddingHorizontal: 16`. Cấu trúc gồm `View` leading (cố định width), `View` nội dung (`flex: 1`) chứa label và supporting text, và trailing element. Divider là `View` `height: StyleSheet.hairlineWidth` với `marginLeft: 16`. Đặt `keyExtractor` ổn định, và nếu danh sách dài thì bật `getItemLayout` vì chiều cao mục cố định.

**Nguồn**: https://m3.material.io/components/lists/overview ; /specs ; /guidelines

---

## 6. Checkbox

**Khi nào dùng**: chọn một hoặc nhiều tùy chọn, hoặc hiển thị nhóm con. Ưu tiên checkbox hơn switch khi chọn nhiều mục liên quan vì chiếm ít chỗ hơn.

**Thay thế**: radio cho chọn một; switch cho cài đặt độc lập.

**Hành vi cha con**
- Cha được chọn thì chọn hết con, bỏ chọn cha thì bỏ hết con.
- Một số con được chọn thì cha ở trạng thái indeterminate.
- Chọn cha đang indeterminate thì chọn tất cả con.

**Nguyên tắc**: thao tác bật tắt phải có hiệu lực ngay.

**Cấu trúc**: container và icon.

**Số đo (text)**
- Kích thước container: 18dp.
- Corner radius: 2dp.
- Icon: 18dp.
- Target: 48dp.
- Kích thước state layer: 40dp.
- Label bên cạnh: màu on surface, không đổi theo trạng thái.

**Trạng thái**: enabled, disabled, hovered, focused, pressed. Có thêm indeterminate và error (theo mô tả khác biệt với M2).
- Opacity: không đọc được. Màu cụ thể chỉ có trong hình.

**Áp dụng cho React Native**
Dùng `Pressable` với `hitSlop` hoặc `minWidth`/`minHeight: 48` để đạt target. Vẽ hộp 18x18 bằng `View` với `borderRadius: 2`, `borderWidth: 2`. Khi chọn đổi nền sang primary và vẽ dấu tick bằng `View` xoay, hoặc dùng `Text` chứa một ký tự. Indeterminate là một vạch ngang. Dùng `accessibilityRole="checkbox"` và `accessibilityState={{ checked }}`. Với nhóm cha con, tính trạng thái cha từ các con rồi truyền xuống.

**Nguồn**: https://m3.material.io/components/checkbox/overview ; /specs ; /guidelines

---

## 7. Top app bar (trang M3 gọi là App bar)

**Slug**: `/components/app-bars/`. Slug `/components/top-app-bar/` không mở được.

**Khi nào dùng**: cung cấp nội dung và hành động cho màn hình hiện tại: điều hướng, tiêu đề, ảnh và tối đa hai hành động thiết yếu.

**Nguyên tắc**
- Nút leading là menu hoặc back.
- Headline không cắt. Chỉ được xuống tối đa 2 dòng ở biến thể medium flexible và large flexible. Biến thể small không xuống dòng.
- Tối đa 2 hành động trailing trên mobile (search bar: tối đa 2 cộng avatar). Tối đa 4 trên màn hình lớn. Hành động dùng nhiều nhất đặt đầu tiên.
- Không dùng góc cong. Dùng chiều cao mặc định và full width.
- Nhấn mạnh hành động chính bằng một icon button filled hoặc tonal duy nhất.
- Khi cuộn: nền đổi từ màu nền sang màu tương phản (không dùng bóng đổ như M2).

**Các biến thể**
- Search: màn hình chính, nơi tìm kiếm là chính. Hint text có chữ "Search". Chạm mở màn tìm kiếm.
- Small: layout dày đặc, hoặc trang đã cuộn.
- Medium flexible và large flexible: tiêu đề lớn hơn, có thể thu nhỏ khi cuộn.

**Typography headline theo biến thể**

| Biến thể | Headline | Subtitle |
|---|---|---|
| Search | Body large | không có |
| Small | Title large | Label medium |
| Medium flexible | Headline medium | Label large |
| Large flexible | Display small | Title medium |

**Số đo**: chiều cao và padding nằm trong hình, không đọc được dạng text.

**Màu**: surface (container), on surface, on surface variant, surface container (khi cuộn). Search bar: surface container, surface container highest, on surface variant.

**Trạng thái**: không đọc được. Phần text không nêu trạng thái riêng.

**Áp dụng cho React Native**
Dùng một `View` đặt trên đầu màn hình với `flexDirection: 'row'`, `alignItems: 'center'`, `paddingHorizontal: 4` hoặc theo cấu trúc, và chiều cao cố định đọc từ specs (không đọc được dạng text; tự chọn và ghi rõ là ước lượng, ví dụ 64). Trên iOS và Android xử lý safe area bằng `react-native-safe-area-context` nếu được phép, hoặc `SafeAreaView` có sẵn của React Native. Headline là `Text` với `numberOfLines={1}`. Khi cuộn, dùng `onScroll` của `ScrollView` hoặc `Animated` để đổi `backgroundColor` từ nền sang surface container. Nút leading và trailing là `Pressable` 48x48.

**Nguồn**: https://m3.material.io/components/app-bars/overview ; /specs ; /guidelines

---

## 8. Dialogs

**Khi nào dùng**: thông tin quan trọng hoặc quyết định cần người dùng xác nhận. Dialog chặn tương tác cho đến khi người dùng xác nhận, từ chối hoặc hành động. Dùng hạn chế. Thông báo mức ưu tiên thấp hoặc vừa thì dùng snackbar.

**Các loại**: basic (alert, chọn nhanh, xác nhận, date/time picker) và full-screen (cho tác vụ nhiều bước, nhập liệu, thay đổi chưa lưu).

**Nguyên tắc**
- Tiêu đề ngắn gọn, cụ thể. Tránh xin lỗi, "Warning!", "Are you sure?".
- Tối đa 2 hành động, căn phải, hành động xác nhận gần mép phải nhất.
- Vô hiệu hóa nút xác nhận cho đến khi người dùng chọn xong. Không bao giờ vô hiệu hóa nút hủy.
- Một hành động duy nhất chỉ dùng cho xác nhận đã biết.
- Không dùng nhãn mơ hồ như "Done", "OK", "Close" để xác nhận.
- Không thêm nút thứ ba như "Learn more".
- Full-screen: dùng Save, icon đóng là điều hướng duy nhất. Khi bỏ thay đổi, hiện basic dialog xác nhận lại.

**Xác nhận hành động phá hủy (destructive)**: dùng basic dialog với nút xác nhận có nhãn cụ thể theo hành động (ví dụ "Delete task"), hành động hủy ở bên trái. Hành động phá hủy không thể hoàn tác thì nên xác nhận. Khi có thể hoàn tác, cân nhắc snackbar với nút Undo thay vì dialog. Phần này là khuyến nghị dựa trên nguyên tắc "Use sparingly" và "confirm action", không phải quy định trực tiếp từ trang.

**Số đo (basic dialog)**

| Thuộc tính | Basic | Full-screen |
|---|---|---|
| Corner radius | 28dp | 0dp |
| Chiều rộng | min 280dp, max 560dp | chiều rộng container, max 560dp |
| Icon | 24dp | 24dp |
| Divider | 1dp | 1dp |
| Padding mép | 24dp | 24dp (trên, trái, phải) |
| Giữa các nút | 8dp | không áp dụng |
| Giữa title và body | 16dp | không áp dụng |
| Giữa icon và title | 16dp | không áp dụng |
| Giữa body và action | 24dp | không áp dụng |
| Chiều cao header | không áp dụng | 56dp |
| Chiều cao thanh action dưới | không áp dụng | 56dp |

- Basic: căn giữa nếu có icon, căn trái nếu không có icon.
- Full-screen: headline căn trái.
- Khoảng cách tối thiểu 56dp từ mép màn hình khi đặt tùy chỉnh.

**Màu**
- Basic: container surface container high, icon secondary, headline on surface, supporting text on surface variant, nút primary, scrim.
- Full-screen: container surface container high, chữ on surface, nút text primary.

**Trạng thái**: không đọc được riêng. Nút theo trạng thái button.

**Áp dụng cho React Native**
Dùng `Modal` với `transparent` và `animationType="fade"`, và một `Pressable` phủ nền làm scrim (`backgroundColor` đen với opacity tự chọn). Panel là `View` có `borderRadius: 28`, `padding: 24`, `minWidth: 280`, `maxWidth: 560`, `backgroundColor` surface container high. Hàng nút là `View` với `flexDirection: 'row'`, `justifyContent: 'flex-end'`, `gap: 8`. Nút xác nhận vô hiệu hóa bằng `disabled`. Trên Android, nút Back cứng gọi `onRequestClose`. Dùng `accessibilityViewIsModal` để tránh lấy focus ra ngoài.

**Nguồn**: https://m3.material.io/components/dialogs/overview ; /specs ; /guidelines

---

## 9. Snackbar

**Khi nào dùng**: thông báo quá trình app đã hoặc sẽ làm. Ít gây gián đoạn, nằm dưới cùng.

**Nguyên tắc**
- Một snackbar tại một thời điểm. Không xếp chồng, không đặt cạnh nhau.
- Tối đa một hành động (text button). Nút đóng là tùy chọn.
- Không dùng filled hoặc elevated button trong snackbar. Màu chữ hành động khác màu nhãn.
- Không có hành động: tự tắt sau 4 đến 10 giây tùy nền tảng. Có hành động: giữ đến khi người dùng thao tác hoặc đóng.
- Một dòng khi có thể, tối đa hai dòng trên mobile. Không dùng icon, chữ trang trí, hay link trong nội dung.
- Đặt ở đáy, phía trước nội dung chính. Nằm trên FAB, không đè lên hoặc nằm sau FAB. Không đặt phía trước thanh navigation.
- Không sát một mép màn hình.

**So với dialog**: snackbar ưu tiên thấp, hành động tùy chọn. Dialog ưu tiên cao, yêu cầu hành động.

**Số đo (text)**
- Trên compact: chiều cao từ 48dp lên 64dp khi nội dung một đến hai dòng.
- Trên medium và expanded: co giãn theo chiều ngang.
- Các số đo khác nằm trong hình: không đọc được.

**Màu**: container inverse surface, chữ inverse on surface, hành động inverse primary, icon đóng inverse on surface.

**Trạng thái**: không có trạng thái tương tác riêng được ghi trong text.

**Áp dụng cho React Native**
Dùng một `View` `position: 'absolute'`, `bottom` cách đáy một khoảng (cộng safe area và cao hơn FAB nếu có), `left: 16`, `right: 16`, `minHeight: 48`, `borderRadius` theo spec (không đọc được; tự chọn và ghi là ước lượng), `backgroundColor` inverse surface, `paddingHorizontal: 16`. Quản lý một snackbar duy nhất bằng state trong component cha hoặc context. Dùng `setTimeout` để tự tắt khi không có hành động, và `clearTimeout` khi có hành động. Hành động là `Pressable` với màu inverse primary. Đặt `accessibilityLiveRegion="polite"` để đọc thông báo.

**Nguồn**: https://m3.material.io/components/snackbar/overview ; /specs ; /guidelines

---

## 10. Progress indicators (linear)

**Khi nào dùng**: thể hiện trạng thái tiến trình như đang tải, gửi, lưu.

**Bảng thời gian chờ**

| Thời gian chờ dự kiến | Khuyến nghị |
|---|---|
| Dưới 200ms | Không dùng indicator |
| 200ms đến 5s | Loading indicator |
| Trên 5s | Progress indicator |

**Nguyên tắc**
- Một indicator cho một nhóm mục, không cho từng mục.
- Determinate: biết tiến độ. Indeterminate: chưa biết, chuyển sang determinate khi biết.
- Linear phù hợp đặt sát mép container. Không dùng cho phần tử nhỏ hơn 40dp, cách mỗi đầu ít nhất 4dp.
- Linear cách mép màn hình 4dp. Đảo chiều trong RTL.
- Một variant cho một quy trình, dùng nhất quán ở mọi nơi.

**Cấu trúc**: active indicator (chấm bắt đầu tiến trình), track, stop indicator (vòng tròn 4dp, chỉ cho determinate, bắt buộc khi tương phản track với nền dưới 3:1).

**Số đo (text)**
- Track mặc định: 4dp. Đổi độ dày: chỉ Expressive.
- Hình dạng mặc định: flat. Wavy: chỉ Expressive.
- Kích thước linear và circular cụ thể nằm trong hình: không đọc được.

**Màu**: active indicator primary, track secondary container.

**Trạng thái**: determinate và indeterminate. Không có trạng thái tương tác riêng.

**Áp dụng cho React Native**
Dùng hai `View`: track (`height: 4`, `borderRadius: 2`, `backgroundColor` secondary container, `overflow: 'hidden'`) và active indicator bên trong. Determinate: `width` là phần trăm, dùng `Animated.timing` để chuyển động. Indeterminate: `Animated.loop` đẩy một đoạn `View` chạy qua lại. Đặt `accessibilityRole="progressbar"` và `accessibilityValue={{ now, min: 0, max: 100 }}`. Không dùng `ActivityIndicator` làm linear vì nó chỉ có dạng vòng.

**Nguồn**: https://m3.material.io/components/progress-indicators/overview ; /specs ; /guidelines

---

## 11. Badges

**Khi nào dùng**: báo thông báo, số lượng, hoặc thông tin gắn với một điểm đến điều hướng. Đặt ở cạnh phải trên của icon, thường trong navigation bar, rail, app bar, hoặc tab.

**Các loại**: small (chấm nhỏ, thể hiện chưa đọc) và large (nhãn có số).

**Nguyên tắc**
- Vị trí cố định ở góc trên cạnh cuối của icon. Không di chuyển, không đặt đè lên icon. Trong RTL thì đảo.
- Large badge tối đa 4 ký tự, kể cả dấu "+".
- Giữ màu mặc định. Nếu tùy chỉnh, giữ tương phản tối thiểu 3:1.
- Có chỗ thì dùng large (ví dụ rail). Chỗ hẹp như app bar thì dùng small.
- Ẩn badge khi điểm đến đã được chọn.

**Số đo (text)**

| Thuộc tính | Giá trị |
|---|---|
| Kích thước small badge | 6dp |
| Corner radius small badge | 3dp |
| Corner radius large badge | 8dp |
| Large badge một chữ số | 16dp |
| Large badge tối đa | 16x34dp |
| Padding từ badge đến chữ | 4dp |
| Khoảng cách từ góc icon đến góc badge (small) | 6x6dp (HxW) |
| Khoảng cách từ góc icon đến góc badge (large) | 14x12dp (HxW) |

**Màu**: container error, nhãn on error (trong navigation bar và rail).

**Trạng thái**: không có trạng thái tương tác riêng trong text.

**Áp dụng cho React Native**
Bọc icon trong `View` `position: 'relative'`. Badge là `View` `position: 'absolute'`, đặt `top` và `right` âm nhẹ theo số đo ở trên (tự tính). Small: `width: 6`, `height: 6`, `borderRadius: 3`, `backgroundColor` error. Large: `minWidth: 16`, `height: 16`, `borderRadius: 8`, `paddingHorizontal: 4`, nhãn là `Text` `fontSize` nhỏ, căn giữa. Chữ không được vượt 4 ký tự. Đặt `accessibilityLabel` mô tả số lượng cho icon.

**Nguồn**: https://m3.material.io/components/badges/overview ; /specs ; /guidelines (trang gọi là "Badge")

---

## Mục không đọc được

| Mục | Lý do |
|---|---|
| Opacity state layer (tất cả component) | Bảng token không hiện trong text của trang |
| Số đo nằm trong hình: app bar (height, padding), snackbar (radius), buttons (padding bảng XS-XL), progress (kích thước linear/circular), lists (chiều cao chi tiết), text fields (corner radius filled) | Chỉ có trong diagram |
| Empty states | Không tìm thấy trang nào trên m3.material.io |
| Giá trị màu cụ thể (hex) | Chỉ có role token, không có giá trị hex trong text |

## Ghi chú về phiên bản

- Nguồn là trang hiện hành trên m3.material.io, có cập nhật M3 Expressive (từ 2024 đến 2025). Các mục đánh dấu Expressive không nằm trong M3 gốc.
- Các chữ "Differences from M2" trong nguồn cho biết thay đổi so với Material 2; không cần thiết cho việc dựng UI M3.
