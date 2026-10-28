# Material Design 3: Accessibility, Interaction States, Iconography, Design Tokens

> Nguồn: các trang m3.material.io đã mở bằng trình duyệt (ngày truy cập: 2026-10-28). Mỗi mục có URL nguồn ở cuối.
> Phần "Áp dụng cho React Native" là gợi ý triển khai của người viết, KHÔNG phải nội dung của Material. Các API React Native trong đó chưa được đối chiếu với tài liệu RN trong lần nghiên cứu này, cần kiểm chứng lại.
> Ghi chú: mục nào không đọc được sẽ ghi rõ "không đọc được".

---

## 0. Phạm vi và các chỗ không đọc được

- `/foundations/accessible-design/overview`: URL này chuyển hướng sang `/foundations/overview/principles` (trang "Accessibility overview"). Nội dung đã đọc.
- `/foundations/accessible-design/accessibility-basics`: không đọc được (trang báo "This page cannot be found").
- `/foundations/accessible-design/patterns`: không đọc được (trang báo "This page cannot be found").
- Content design (`/foundations/content-design/overview`) chỉ có phần tổng quát (UI text rõ ràng, theo AP Style). Hướng dẫn riêng về **error messages** và **empty states**: không đọc được (chưa tìm thấy trang nguồn đã mở được).
- Trạng thái (states): trang `/foundations/interaction/states/overview` liệt kê **6** trạng thái (Enabled, Disabled, Hover, Focused, Pressed, Dragged), không phải 7. Tài liệu này ghi theo 6 trạng thái nguồn đưa ra.
- Trang `/foundations/designing/overview` không có danh sách icon/target riêng; các số đo nằm ở `/designing/structure`.

---

## 1. Color contrast (độ tương phản màu)

**Nội dung nguồn:**
- Contrast ratio đi từ 1:1 đến 21:1, theo công thức luminance của W3C.
- Text nhỏ (small text): tối thiểu **4.5:1** so với nền.
- Large text (từ 14pt bold / 18pt regular trở lên) và graphics: tối thiểu **3:1** so với nền.
- Disabled state không cần đạt yêu cầu tương phản.
- Nút nằm thành cụm (cluster, ví dụ nhóm button): container color so với nền cần **3:1**, để người dùng phân biệt từng nút trong nhóm.
- Component đứng riêng, nổi bật (ví dụ FAB): không bắt buộc 3:1 giữa container và nền.
- Với ảnh minh họa: phần thông tin thiết yếu (essential) phải đạt yêu cầu tương phản và kích thước; phần trang trí (non-essential) thì không.
- Note của Material: có thể dùng các color role khác (ví dụ tertiary / on tertiary) miễn là container và text đạt 3:1.

**Nguồn:** https://m3.material.io/foundations/designing/color-contrast ; https://m3.material.io/foundations/writing/best-practices (phần Text color)

**Áp dụng cho React Native:**
- Kiểm tra tương phản bằng token (xem mục 7), không hardcode hex trong từng component.
- Text thường: ≥ 4.5:1. Text lớn, icon có nghĩa, viền/container của nhóm control: ≥ 3:1.
- Trạng thái disabled có thể bỏ qua ngưỡng, nhưng phải có thêm tín hiệu khác (không chỉ màu).

---

## 2. Touch target và spacing

**Nội dung nguồn:**
- Touch target tối thiểu khuyến nghị: **48 x 48dp** (khoảng 9mm vật lý; khoảng khuyến nghị cho màn hình cảm ứng 7–10mm). Target có thể lớn hơn để phục vụ nhiều người dùng hơn.
- iOS khuyến nghị **44 x 44dp**.
- Pointer target (chuột, bút): tối thiểu khuyến nghị **44dp**.
- Icon 24dp có target 48dp. Star icon 40dp và các touch target đều 48dp (theo ví dụ của trang).
- Khoảng cách giữa các target: từ **8dp** trở lên thường cân bằng mật độ thông tin và khả năng dùng.
- Icon nhỏ: xem mục 6 về target của icon 20dp (40dp khi dùng chuột và bàn phím).
- State layer có kích thước **40dp**, interactive target là **48dp** (xem mục 4).

**Nguồn:** https://m3.material.io/foundations/designing/structure (phần Target sizes) ; https://m3.material.io/styles/icons/applying-icons (phần Target size) ; https://m3.material.io/foundations/interaction/states/state-layers

**Áp dụng cho React Native:**
- Mặc định mọi control tương tác: visual có thể nhỏ hơn, nhưng vùng bấm tối thiểu 48x48. Dùng `hitSlop` (ví dụ `hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}` cho icon 24dp) hoặc đặt `minWidth/minHeight: 48` lên `Pressable`.
- Giữ khoảng cách giữa hai target ít nhất 8dp (dùng `gap` hoặc `margin`), tránh hai `hitSlop` đè lên nhau.

---

## 3. Labels, roles, semantics

**Nội dung nguồn:**
- Accessibility label mô tả **mục đích và hành vi** của element, không mô tả hình dạng (ví dụ không nói "magnifying glass" mà nói mục đích tìm kiếm).
- Cần label cho: icon/button không có chữ nhìn thấy hoặc không đủ ngữ cảnh (ví dụ nút sửa có icon bút chì); interactive image; visual cue (progress bar, xử lý lỗi); icon mang ý nghĩa (icon trạng thái); ảnh có nghĩa (diagram, ảnh chụp, minh họa).
- Text có label bổ sung khi chung chung: "Learn more", hoặc nút "Save" lặp nhiều lần trên trang.
- KHÔNG cần label cho: text không tương tác (screen reader đọc tự động); button đã có text đủ rõ (ví dụ "Download image").
- KHÔNG đưa tên loại element vào label (ví dụ "button", "menu"). Screen reader tự thêm role; nếu lặp sẽ thành "Got it button button".
- Icon và ảnh trang trí: đánh dấu là decorative để ẩn khỏi accessibility tree.
- Gán role cho mọi element tương tác: trên mobile theo loại component của design system (button, slider, menu...).
- Alt text: ngắn (tối đa 125 ký tự), không thêm "image of/picture of". Thông tin quan trọng nằm trong ảnh (text trong ảnh) phải đưa vào alt text, vì screen reader không đọc được chữ trong ảnh.
- Nguyên tắc chung: dùng component chuẩn của platform (native element, dialog chuẩn) thay vì tự làm, vì chúng đã có markup và hỗ trợ assistive technology sẵn. Component không chuẩn cần test thêm.
- Assistive technology được nhắc đến: screen reader (TalkBack, VoiceOver, JAWS), bàn phím, switch input, magnifier, voice input.

**Nguồn:** https://m3.material.io/foundations/designing/elements ; https://m3.material.io/foundations/writing/best-practices (Alt text) ; https://m3.material.io/foundations/overview/principles ; https://m3.material.io/foundations/overview/assistive-technology

**Áp dụng cho React Native:**
- `accessibilityRole` cho từng control: `"button"`, `"link"`, `"checkbox"`, `"switch"`, `"tab"`, `"header"`... Không tự thêm chữ "button" vào `accessibilityLabel`.
- `accessibilityLabel` mô tả mục đích: ví dụ icon xóa đặt `accessibilityLabel="Xóa mục"`, không đặt "Icon thùng rác".
- Icon trang trí: `accessible={false}` hoặc `importantForAccessibility="no"` (Android) và `accessibilityElementsHidden` (iOS) theo nhu cầu.
- Nhóm nhiều phần tử thành một mục đọc: `accessible={true}` trên container.
- Ảnh có nghĩa: `accessibilityLabel` mô tả ngắn; ảnh trang trí: không có label.

---

## 4. Interaction states và state layers

### 4.1 Sáu trạng thái được nêu (nguồn liệt kê 6, không phải 7)

| Trạng thái | Nội dung nguồn |
|---|---|
| Enabled | Component có thể tương tác, dùng style mặc định. |
| Disabled | Không tương tác được; thể hiện bằng đổi màu và giảm elevation. Không cần đạt tương phản. Không thể focus, drag hoặc press; không đổi trạng thái khi tap hay hover. |
| Hover | Kích hoạt khi con trỏ đứng yên trên element. Hiện/ẩn bằng fade ngắn. Chỉ một element hover tại một thời điểm. |
| Focused | Kích hoạt khi người dùng chọn element bằng bàn phím hoặc giọng nói (Tab). Có ring focus indicator. Chỉ một element focus tại một thời điểm. |
| Pressed | Kích hoạt khi người dùng tap/click, bằng cursor, bàn phím hoặc giọng nói. Dùng ripple overlay. Có thể kèm elevation. Chỉ một pressed state trong layout. |
| Dragged | Khi người dùng giữ và di chuyển element. Dùng overlay mức nhấn thấp (lower emphasis). Chỉ một dragged state trong layout. |

Một số quy tắc đi kèm:
- Trạng thái có thể kết hợp (ví dụ selected + hover, hover + focus).
- Áp dụng nhất quán cho mọi component.
- Hover/focus/pressed không áp dụng cho toàn bộ app bar, mà cho từng action bên trong nó.
- Button disabled không kế thừa hover hay state layer khác.
- Disabled không áp dụng cho FAB, dialog, menu, sheet, tab, tooltip... (xem nguồn). Nguyên tắc nguồn: nếu action của FAB không có thì không hiện FAB.

**Nguồn:** https://m3.material.io/foundations/interaction/states/overview ; https://m3.material.io/foundations/interaction/states/applying-states

### 4.2 State layers và opacity

- State layer là lớp bán trong suốt phủ lên element, dùng cùng màu với content (icon hoặc label). Ví dụ: container dùng secondary container thì content dùng on secondary container, và state layer cũng dùng on secondary container. Nếu container là surface với content là primary thì state layer dùng primary.
- Thứ tự lớp: container (1), state layer (2), content (3).
- Chỉ một state layer áp dụng tại một thời điểm cho một element.
- Kích thước state layer: **40dp**. Interactive target: **48dp**.
- Opacity theo trang nguồn:
  - Hover: **+8%** (0.08)
  - Focus: **+10%** (0.10)
  - Pressed: **+10%** (0.10)
  - Dragged: **+16%** (0.16)
  - Disabled state layer opacity: **0.38** (trang liệt kê giá trị này trong bảng "State opacities"; trang không ghi rõ đây là opacity của lớp nào ngoài nhãn "Disabled state layer opacity").

**Nguồn:** https://m3.material.io/foundations/interaction/states/state-layers

**Áp dụng cho React Native:**
- Dùng `Pressable` với prop `style` dạng hàm nhận `{pressed, hovered, focused}` (RN hỗ trợ `pressed` sẵn; hover/focus phụ thuộc platform, cần kiểm tra thêm với `react-native-web` hoặc bàn phím trên tablet).
- Overlay: một `View` absolute phủ toàn bộ element, màu = màu content, `opacity` theo bảng trên (0.08/0.10/0.10/0.16). Không cộng dồn nhiều overlay: chỉ một state layer tại một thời điểm, nên chọn overlay có ưu tiên (dragged > pressed > focused > hover).
- Ví dụ thiết kế: `backgroundColor` của overlay là `tokens.onSecondaryContainer`, `opacity` = 0.1 khi pressed.
- Disabled: `accessibilityState={{disabled: true}}`, không gắn hover/pressed overlay.
- Trạng thái trong `accessibilityState`: `disabled`, `selected`, `checked`, `busy`, `expanded` (nên đồng bộ với trạng thái visual).

---

## 5. Gestures (cử chỉ)

**Nội dung nguồn:**
- Gesture là các cách người dùng tương tác bằng cảm ứng. UI phải phản hồi theo thời gian thực.
- Các cử chỉ được liệt kê: **Tap** (mở đích, tương tác), **Double tap** (zoom), **Long press** (chức năng phụ, ví dụ chọn item trong list), **Scroll và pan** (dọc, ngang hoặc mọi hướng), **Swipe** (chuyển tab, hoặc hoàn thành action như mở action ẩn của list item), **Predictive back** (trên Android, vuốt trái/phải để quay lại; có thể hủy giữa chừng; áp dụng cho bottom sheet, navigation bar, navigation rail, search bar, side sheet), **Drag** (di chuyển element hoặc trượt surface), **Pick up and move** (giữ rồi kéo để sắp xếp lại), **Pinch** (phóng to để sang màn hình chi tiết), **Compound gestures** (kết hợp pan và pinch trên map).
- Trang không đưa ra ngưỡng thời gian long press hay khoảng cách vuốt cụ thể.

**Nguồn:** https://m3.material.io/foundations/interaction/gestures

**Áp dụng cho React Native:**
- Tap/long press: `onPress`, `onLongPress` của `Pressable`. Long press cho chức năng phụ, và phải có cách khác để làm cùng việc (không chỉ dựa vào long press, vì người dùng assistive tech khó dùng).
- Swipe action: dùng `react-native-gesture-handler` (ngoài nguồn M3, cần kiểm chứng); luôn cung cấp nút tương đương cho screen reader.
- Predictive back trên Android: theo cấu hình của platform/navigation library.
- Pinch/pan: dùng gesture handler, không tự xử lý touch thủ công.

---

## 6. Iconography (biểu tượng)

### 6.1 Kích thước và layout

- Kích thước chuẩn (baseline): **24dp x 24dp**. Thiết kế ở 100% scale để chính xác pixel.
- Kích thước tối ưu bổ sung: **20dp**, **40dp**, **48dp**.
  - 20dp: chủ yếu cho desktop, layout dày, hình ảnh nhỏ.
  - 40dp và 48dp: cho display hoặc headline type, và màn hình lớn; dùng khi cần nhấn mạnh action chính.
- Live area: nội dung icon 24dp nằm trong vùng **20x20dp**, có **2dp** padding quanh viền. Có thể mở rộng vào padding khi cần thêm trọng lượng, nhưng không vượt trim area.
- Keyline: square 18dp, circle 20dp, vertical rectangle 20x16dp, horizontal rectangle 16x20dp. Vị trí phải "on pixel".
- Corner radius mặc định: 2dp. Góc trong của outlined symbol là vuông. Hình rộng ≤ 2dp không bo góc stroke.
- Stroke: khuyến nghị 2dp hoặc weight 400. Dùng stroke terminal vuông.
- Icon phải hướng thẳng (không nghiêng, xoay, hay có chiều sâu giả).

### 6.2 Style (kiểu)

- Material Symbols là mặc định, có 3 style: **outlined**, **rounded**, **sharp**. Legacy Material Icons vẫn có nhưng không có variable font.
- Outlined: nhẹ, phù hợp UI dày đặc. Một số symbol nên giữ filled (ví dụ hình người, icon thương hiệu).
- Rounded: hợp với thương hiệu typography nặng, logo cong.
- Sharp: góc thẳng 0dp, hợp với thiết kế hình chữ nhật.
- Giữ một style nhất quán trong một icon set, không trộn.

### 6.3 Các trục điều chỉnh (axes)

- Có 4 axes: **weight** (100–700), **fill** (0–1), **grade**, **optical size** (20–48dp).
- Không dùng weight 100 cho icon 24dp; mức tối thiểu là 200. Không trộn weight.
- Fill 0 = không đặc; fill 1 = đặc. Dùng để thể hiện trạng thái selected/unselected (ví dụ bottom navigation).
- Grade: icon tối trên nền sáng dùng grade 0; icon sáng trên nền tối dùng khoảng -25. Grade dương làm nét dày hơn, dùng cho trạng thái active.
- Optical size: tự điều chỉnh độ dày nét theo kích thước. Dùng 20dp cho desktop dày; 40–48dp cho action chính.

### 6.4 Đi kèm chữ, target và nhãn

- Cùng kích thước và cùng optical weight với text.
- Baseline của symbol đặt xuống khoảng **11.5%** kích thước chữ.
- Icon 24dp có target **48dp** mặc định. Với chuột + bàn phím, icon 20dp có thể dùng target **40dp**.
- Icon có nhãn (label text) khi trừu tượng, dùng cho navigation. Navigation item bắt buộc có label.
- Icon nhỏ dưới 20dp: nên có nhãn nếu là icon phức tạp hoặc icon là action chính.
- Icon nên dịch/điều chỉnh theo thị trường (ví dụ giỏ hàng: cart, bag hoặc basket tùy vùng).

**Nguồn:** https://m3.material.io/styles/icons/overview ; https://m3.material.io/styles/icons/designing-icons ; https://m3.material.io/styles/icons/applying-icons

**Áp dụng cho React Native:**
- Icon 24dp: `size={24}` (hoặc 20/40/48 theo bảng), vùng bấm tối thiểu 48 bằng `hitSlop` hoặc `minWidth/minHeight: 48`.
- Dùng Material Symbols dưới dạng font (ví dụ qua `@expo/vector-icons` hoặc tệp font đã nhúng) hoặc SVG; chọn đúng style outlined/rounded/sharp cho cả app.
- Icon trang trí: `accessible={false}`. Icon có nghĩa: `accessibilityLabel` mô tả mục đích.
- Trạng thái selected của icon (fill 0/1): đồng bộ với `accessibilityState={{selected: true}}`.
- Lưu ý: chưa xác minh trong nghiên cứu này cách RN nhận Material Symbols variable font (weight/fill/grade) — cần kiểm tra thêm.

---

## 7. Design tokens (token thiết kế)

**Nội dung nguồn:**
- Token là các quyết định thiết kế nhỏ, dùng lại được; gồm một tên dạng code (ví dụ `md.ref.palette.secondary90`) và một giá trị (màu, font, số đo, hoặc tham chiếu sang token khác).
- Tên token bắt đầu từ hệ thống (`md`), tiếp theo là lớp token (`ref`, `sys`, `comp`), rồi tới mục đích (ví dụ `md.comp.fab.primary.container.color`).
- Ba lớp token:
  - **Reference (`ref`)**: toàn bộ lựa chọn có sẵn (palette, typography, measurement). Giá trị tĩnh, không đổi theo ngữ cảnh.
  - **System (`sys`)**: vai trò trong UI (ví dụ màu nền, màu chữ), là nơi xảy ra theming. Trỏ tới reference; có thể đổi theo light/dark theme. Ưu tiên trỏ tới reference hơn là giá trị tĩnh.
  - **Component (`comp`)**: thuộc tính gắn với element của component (container, label text, icon, state, size, shape). Ưu tiên trỏ tới system/reference, không hardcode hex. Ghi chú nguồn: component tokens đang "in development".
- Contexts: giá trị thay đổi theo điều kiện như form factor, dark theme, dense layout, RTL. Ví dụ `sys` background trỏ tới reference khác nhau cho light và dark.
- Dùng token thay vì giá trị hardcode. Token phù hợp khi sản phẩm có design system và sẽ được bảo trì lâu dài; ít hữu ích nếu app dùng giá trị cứng và ít thay đổi.
- Token cho phép đổi theme toàn bộ (ví dụ high contrast) mà không sửa component.

**Nguồn:** https://m3.material.io/foundations/design-tokens/overview

**Áp dụng cho React Native:**
- Ba file/lớp trong code:
  - `ref`: bảng palette và scale (hằng số hex, font size, spacing).
  - `sys`: object theo vai trò, ví dụ `sys.color.primary`, `sys.color.onPrimary`, có hai bản light và dark.
  - `comp`: object cho từng component (ví dụ `comp.button.filled.container`), trỏ tới `sys`.
- Đặt đúng vị trí cho theme: `useColorScheme()` để chọn bản light/dark của `sys`.
- Không dùng hex trong JSX; mọi màu lấy từ `comp` hoặc `sys`.
- Tên token theo mẫu nguồn để dễ đối chiếu với Material docs.

---

## 8. Layout, structure và focus order

**Nội dung nguồn (structure):**
- Thứ tự đọc của screen reader dựa trên cấu trúc (trên web là HTML; trên mobile là cây element). Thiết kế và phát triển cần thống nhất thứ tự.
- Phân cấp (hierarchy) bằng màu, hình, chữ, chuyển động. Đặt action quan trọng ở đầu hoặc cuối màn hình (dễ với tới bằng shortcut). Các item liên quan nằm cạnh nhau.
- Landmark và heading (web only): có 8 landmark role. Heading không nhảy cấp (không H2 sang H4); một H1 cho tiêu đề trang; heading dựa trên cấu trúc thông tin, không dựa trên kiểu dáng.
- Đây là nội dung chủ yếu cho web; với app native, áp dụng nguyên tắc thứ tự và phân cấp.

**Nội dung nguồn (flow — focus order & key traversal):**
- Thứ tự focus mặc định theo DOM (thứ tự viết trong source), thường trái sang phải, trên xuống dưới. Dùng mặc định trừ khi có lý do.
- Xác định initial focus khi màn hình tải, và focus cho component có nhiều tương tác (card phức tạp, dialog).
- Dialog: khi mở, focus chuyển vào dialog (ví dụ ô nhập đầu tiên); khi đóng hoặc hủy, focus quay lại element đã mở dialog.
- Tab / Shift+Tab di chuyển giữa các tương tác; phím mũi tên đi bên trong component (menu, ô trong form); Enter kích hoạt button/link.
- Có thể gom nhóm nhiều tương tác thành một tab stop và dùng mũi tên để đi giữa các phần tử con.
- Phím tắt: mặc định dùng tổ hợp từ 2 phím trở lên. Phải có danh sách/hướng dẫn phím tắt. Phím tắt đơn cần cho người dùng cách đổi (remap), hoặc chỉ kích hoạt khi component liên quan đang focus, hoặc tắt (chỉ là giải pháp tạm).

**Nguồn:** https://m3.material.io/foundations/designing/structure ; https://m3.material.io/foundations/designing/flow

**Áp dụng cho React Native:**
- Thứ tự đọc: sắp xếp JSX theo đúng thứ tự thị giác; tránh dùng `position: absolute` làm đảo thứ tự đọc mà không kiểm tra lại.
- Focus khi mở modal: `AccessibilityInfo.setAccessibilityFocus(reactTag)` (RN API, cần kiểm chứng) để chuyển focus vào dialog; trả focus về trigger khi đóng.
- Heading: `accessibilityRole="header"` cho tiêu đề section.
- Phím tắt và keyboard focus trên RN (tablet, web qua `react-native-web`): cần kiểm tra riêng; nguồn chỉ nói về nguyên tắc chung.

---

## 9. Text resizing, truncation và text

**Nội dung nguồn:**
- Hỗ trợ tăng chữ tối thiểu **200%**. Người dùng có thể đặt từ OS hoặc trong app.
- Khi tăng chữ: line height và text scale theo hệ số; padding và khoảng cách giữ nguyên ở 1x. Component không có chữ (progress, checkbox, radio) không đổi kích thước.
- Khi OS không kiểm soát được: đưa multiplier như 1.5x, 2x. Ví dụ font 14pt x 2 = 28pt.
- Khi chữ quá lớn: tăng kích thước container, reflow layout (xếp chồng thay vì cạnh nhau), bật scroll (ưu tiên cuộn dọc), dùng tooltip để hiện chữ phóng to (app bar, navigation bar, navigation rail, tab cố định).
- Truncation: thông tin không được mất khi chữ tăng, khi dịch sang ngôn ngữ dài hơn. Ưu tiên wrap; nếu cắt bằng ellipsis thì phải có cách xem đầy đủ (tooltip hoặc link). Ellipsis không có cách xem thì không đạt yêu cầu.
- Accessibility text (screen reader) đọc cả text nhìn thấy và alt text không nhìn thấy.

**Nguồn:** https://m3.material.io/foundations/writing/text-resizing ; https://m3.material.io/foundations/writing/text-truncation ; https://m3.material.io/foundations/writing/best-practices

**Áp dụng cho React Native:**
- Không đặt `allowFontScaling={false}` trên text thường. Nếu bắt buộc giới hạn, dùng `maxFontSizeMultiplier` (RN API, cần kiểm chứng) ở mức hợp lý.
- Container dùng `flexGrow`/`minHeight` thay vì chiều cao cố định; cho phép wrap.
- Truncation: `numberOfLines` kèm nút "Xem thêm" hoặc màn hình chi tiết.
- Tooltip thay cho nhãn bị cắt: dùng modal/popover tự làm, vì nguồn không chỉ định API RN.

---

## 10. Content design (UI text, error messages, empty states)

**Nội dung nguồn (đã đọc):**
- UI text phải rõ ràng với mọi người. Theo AP Style nếu không có quy định khác.
- Tài liệu chi tiết về writing (best practices, text resizing, truncation) đã đọc ở mục 9 và mục 3.

**Không đọc được:**
- Hướng dẫn riêng về **error messages**.
- Hướng dẫn riêng về **empty states**.
- Hướng dẫn về giọng văn (tone), độ dài nhãn nút cụ thể.

Ghi chú: không suy diễn các nội dung này từ kiến thức chung. Cần mở lại các trang content-design con (nếu có) để xác nhận.

**Nguồn:** https://m3.material.io/foundations/content-design/overview ; https://m3.material.io/foundations/writing (chuyển hướng sang /foundations/writing/best-practices)

**Áp dụng cho React Native:**
- Nhãn nút: dùng động từ cụ thể (theo nguyên tắc "label mô tả mục đích"; xem mục 3). Tránh nhãn chung như "Learn more" hoặc "Save" lặp lại nhiều lần mà không có ngữ cảnh.
- Error message, empty state: chưa có hướng dẫn từ nguồn đã đọc, cần chờ nghiên cứu bổ sung.

---

## 11. Checklist ngắn cho React Native

- [ ] Mọi control tương tác có `accessibilityRole` và `accessibilityLabel` mô tả mục đích.
- [ ] Trạng thái (`disabled`, `selected`, `checked`, `busy`, `expanded`) khớp giữa visual và `accessibilityState`.
- [ ] Vùng bấm ≥ 48x48dp (`hitSlop` hoặc min size); khoảng cách giữa target ≥ 8dp.
- [ ] Text ≥ 4.5:1; text lớn, icon có nghĩa, viền nhóm control ≥ 3:1; disabled được miễn.
- [ ] Icon 24dp trong live area 20x20; trang trí đánh dấu ẩn khỏi accessibility.
- [ ] Hover/focus/pressed/dragged dùng opacity 0.08 / 0.10 / 0.10 / 0.16, chỉ một state layer tại một thời điểm.
- [ ] Màu lấy từ token (`ref` → `sys` → `comp`), có bản light và dark.
- [ ] Hỗ trợ tăng chữ 200%, không cắt nội dung mất.
- [ ] Focus khi mở dialog và trả về khi đóng.

---

## Danh sách URL nguồn đã đọc

- https://m3.material.io/foundations/designing/overview (đọc: phần Accessibility markup, Implementing accessibility)
- https://m3.material.io/foundations/designing/color-contrast
- https://m3.material.io/foundations/designing/structure
- https://m3.material.io/foundations/designing/flow
- https://m3.material.io/foundations/designing/elements
- https://m3.material.io/foundations/interaction/states/overview
- https://m3.material.io/foundations/interaction/states/applying-states
- https://m3.material.io/foundations/interaction/states/state-layers
- https://m3.material.io/foundations/interaction/gestures
- https://m3.material.io/foundations/overview/principles (chuyển hướng từ accessible-design/overview)
- https://m3.material.io/foundations/overview/assistive-technology
- https://m3.material.io/styles/icons/overview
- https://m3.material.io/styles/icons/designing-icons
- https://m3.material.io/styles/icons/applying-icons
- https://m3.material.io/foundations/design-tokens/overview
- https://m3.material.io/foundations/content-design/overview
- https://m3.material.io/foundations/writing/best-practices
- https://m3.material.io/foundations/writing/text-resizing
- https://m3.material.io/foundations/writing/text-truncation

## URL không đọc được

- https://m3.material.io/foundations/accessible-design/accessibility-basics (404)
- https://m3.material.io/foundations/accessible-design/patterns (404)
- Trang error messages và empty states: không đọc được.
