# Material Design 3 – Tài liệu tham chiếu cho PlannerApp

Liên quan: [de-bai.md](de-bai.md) (đề bài), [business-logic.md](business-logic.md) (nghiệp vụ), [architecture.md](architecture.md) (kiến trúc).

> **Ghi chú nguồn.** Dữ liệu thô nằm trong `docs/m3/` (5 file nghiên cứu: `typography-shape-elevation.md`, `motion-expressive.md`, `layout-adaptive.md`, `components.md`, `accessibility-states-icons.md`). Các tài liệu này được tạo từ các trang m3.material.io đọc qua trình duyệt (ngày truy cập 2026-10-28), không phải từ thư viện UI nào. Tài liệu này gộp chúng thành một bản duy nhất và thêm mục 10 (áp dụng cho app).
>
> Quy ước: số liệu lấy nguyên từ file nghiên cứu. Chỗ hai nguồn lệch nhau hoặc số liệu khác giá trị M3 thường gặp được ghi trong khối **Cần kiểm tra**. Chỗ không đọc được nằm ở **Phụ lục: Phần chưa đọc được** (cuối file); không có giá trị nào được bịa thêm. Phần "Áp dụng cho React Native" là gợi ý triển khai, không phải nội dung của Material.
>
> **Riêng mục 2 (Color):** không có file nghiên cứu nào về màu trong `docs/m3/`. Nội dung mục 2 dựa trên danh sách vai trò đã được xác minh từ trang roles (nguồn ghi ở mục) cộng với phần đối chiếu độ tương phản từ `accessibility-states-icons.md`. Trang màu không công bố mã hex; bảng màu của app trong `src/theme/colors.ts` là baseline light scheme (seed `#6750A4`) **viết theo trí nhớ**, cần đối chiếu lại với Material Theme Builder.

---

## 1. Tổng quan và triết lý

- **M3** (Material Design 3) là hệ thiết kế hiện hành của Material, gồm ba nhóm nội dung: **foundations** (layout, tương tác, accessibility, design tokens, content design), **styles** (color, typography, shape, elevation, motion, icons, spacing) và **components** (button, chip, card, text field, ...).
- **M3 Expressive** (2024–2025) **không phải** phiên bản mới: blog ghi rõ "không deprecate M3, đây không phải M4". Nó bổ sung: motion physics (spring) thay easing + duration ở mức component; shape morph và thư viện 35 hình; emphasized type styles; mở rộng bảng màu; thêm hoặc cập nhật component (blog ghi "Fourteen", trang get-started ghi "15").
- **Ba trụ cột** thường dùng để đọc M3 (theo cấu trúc trang get-started): **foundations** (nền tảng thiết kế), **styles** (token hình ảnh), **components** (thành phần dựng sẵn). Trong app này chỉ lấy các token và quy tắc, tự dựng component bằng `Pressable` và `StyleSheet`, vì đề cấm UI library.
- Nguồn: https://m3.material.io/get-started ; https://m3.material.io/blog/building-with-m3-expressive

> **Cần kiểm tra (1):** số component mới hoặc cập nhật là 14 (blog) hay 15 (get-started). Hai nguồn lệch nhau, chưa chọn.
> **Cần kiểm tra (2):** "ba trụ cột" ở trên là cách chia theo cấu trúc site (foundations / styles / components), không phải câu chữ nguyên văn của M3. Nếu cần trích đúng "3 trụ cột" của Expressive thì phải mở lại trang giới thiệu Expressive; xem Phụ lục.

---

## 2. Color

Nguồn: https://m3.material.io/styles/color/roles (danh sách vai trò); https://m3.material.io/foundations/designing/color-contrast (độ tương phản).

### 2.1 Các vai trò theo sáu nhóm

| Nhóm | Vai trò | Cách dùng |
|---|---|---|
| Primary | `primary`, `on-primary`, `primary-container`, `on-primary-container` | Nổi bật nhất: FAB, button nhấn mạnh cao, trạng thái active |
| Secondary | `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container` | Ít nổi bật hơn: filter chip, tonal button |
| Tertiary | `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container` | Điểm nhấn tương phản: badge, input field; tuỳ quyết định của designer |
| Error | `error`, `on-error`, `error-container`, `on-error-container` | Lỗi, cảnh báo. Vai trò error là **tĩnh** (không đổi theo seed hay dynamic color) |
| Surface | `surface`, `on-surface`, `on-surface-variant`, 5 mức surface container, và `outline`, `outline-variant` | Nền, chữ, đường viền |
| Inverse và khác | `inverse-surface`, `inverse-on-surface`, `inverse-primary`, `scrim`, `shadow` | Snackbar, lớp phủ modal |

Tổng số vai trò tuỳ cách đếm; xem **Cần kiểm tra (3)** ở cuối mục.

### 2.2 Quy tắc ghép cặp

- Mỗi vai trò nền có vai trò chữ/icon đi kèm: `primary` đi với `on-primary`, `primary-container` đi với `on-primary-container`, và tương tự cho secondary, tertiary, error. Không đặt chữ `on-*` của nhóm này lên nền của nhóm khác.
- `container` là bản nhạt hơn của vai trò gốc, dùng cho nền ít nhấn mạnh (ví dụ tonal button dùng `secondary-container` + `on-secondary-container`).
- `on-surface-variant` là màu chữ phụ trên `surface`; `on-surface` là màu chữ mặc định.
- State layer dùng cùng màu với content (xem mục 9.3).

### 2.3 Surface container (5 bậc)

`surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`. Các surface chồng lên nhau phải khác color role để thể hiện tách biệt; role không gắn cứng với elevation (xem mục 5). Ví dụ trong nghiên cứu components: elevated card dùng `surface-container-low`, filled card dùng `surface-container-highest`, dialog dùng `surface-container-high`.

### 2.4 Outline và outline variant

| Vai trò | Dùng cho | Không dùng cho |
|---|---|---|
| `outline` | Ranh giới quan trọng: viền text field, viền outlined button, viền nhóm control | Đường trang trí |
| `outline-variant` | Trang trí: divider, viền card outlined | **Không** dùng để xác định ranh giới của một target tương tác |

> **Cần kiểm tra (4):** `components.md` ghi viền filter chip và input chip là `outline-variant`, và viền outlined button là `outline variant`; trong khi quy tắc ở trên nói `outline-variant` không dùng cho ranh giới target. Hai điều này mâu thuẫn nhau trên cùng nguồn. App đang dùng `outline` cho chip và button (xem mục 10).

### 2.5 Inverse

`inverse-surface` (nền), `inverse-on-surface` (chữ), `inverse-primary` (nút hành động) dùng cho snackbar; các role này tương phản ngược với theme hiện tại.

### 2.6 Fixed (add-on, tránh dùng)

Các vai trò `*-fixed` và `*-fixed-dim` (primary, secondary, tertiary) giữ nguyên màu giữa light và dark theme. Đây là nhóm bổ sung, không được xác minh từ trang đọc trong lần này (theo trí nhớ). **App không dùng**: chỉ có light theme.

### 2.7 Độ tương phản (xác minh từ trang color-contrast)

- Chữ nhỏ: >= 4.5:1. Chữ lớn (>= 14pt bold hoặc 18pt regular) và graphics: >= 3:1.
- Disabled không cần đạt ngưỡng nhưng nên có thêm tín hiệu không chỉ là màu.
- Nút trong một cụm: container so với nền cần 3:1 để phân biệt từng nút. Component đứng riêng và nổi bật (FAB) không bắt buộc.
- Có thể dùng cặp role khác (ví dụ tertiary / on-tertiary) miễn container và chữ đạt 3:1.
- Badge: giữ màu mặc định; nếu tuỳ chỉnh thì giữ tối thiểu 3:1.

> **Cần kiểm tra (3):** ba cách đếm vai trò khác nhau trên cùng danh sách: (a) 4 nhóm màu x 4 = 16; (b) cộng `surface`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant` = 21, cộng 3 vai trò inverse = 24, cộng `scrim` và `shadow` = 26 (khớp con số "26" của yêu cầu) nhưng chưa tính 5 surface container, `surface-dim`, `surface-bright`; (c) tính đủ thì hơn 30. Chưa có bản đọc trực tiếp để chốt con số 26.
> **Cần kiểm tra (5):** mã hex baseline trong `src/theme/colors.ts` (ví dụ `#6750A4`, `#FEF7FF`, `#F3EDF7`) được viết theo trí nhớ, trang M3 không công bố hex. Cần đối chiếu bằng Material Theme Builder.

---

## 3. Typography

Nguồn: https://m3.material.io/styles/typography/overview ; /type-scale-tokens ; /applying-type ; /fonts

### 3.1 Tổng quan

- 30 type style: 15 baseline và 15 emphasized, từ Display Large đến Label Small. Mỗi style có một token gom đủ font, size, line height, tracking, weight.
- Font mặc định Roboto. Roboto Flex là variable font, chưa nằm trong type scale M3; chuỗi fallback Roboto Flex -> Roboto -> Noto Sans.
- Đơn vị: sp (Android), RN dùng trực tiếp số.

### 3.2 Baseline type scale

| Role | Style | Size | Line height | Weight | Tracking |
|---|---|---|---|---|---|
| Display | Large | 57 | 64 | 400 | -0.25 |
| Display | Medium | 45 | 52 | 400 | 0 |
| Display | Small | 36 | 44 | 400 | 0 |
| Headline | Large | 32 | 40 | 400 | 0 |
| Headline | Medium | 28 | 36 | 400 | 0 |
| Headline | Small | 24 | 32 | 400 | 0 |
| Title | Large | 22 | 28 | 400 | 0 |
| Title | Medium | 16 | 24 | 500 | 0.15 |
| Title | Small | 14 | 20 | 500 | 0.1 |
| Body | Large | 16 | 24 | 400 | 0.5 |
| Body | Medium | 14 | 20 | 400 | 0.25 |
| Body | Small | 12 | 16 | 400 | 0.4 |
| Label | Large | 14 | 20 | 500 | 0.1 |
| Label | Medium | 12 | 16 | 500 | 0.5 |
| Label | Small | 11 | 16 | 500 | 0.5 |

### 3.3 Emphasized type scale

Cùng size và tracking với baseline; khác ở weight (theo nguồn):

| Role | Display (L/M/S) | Headline (L/M/S) | Title Large | Title Medium/Small | Body (L/M/S) | Label (L/M/S) |
|---|---|---|---|---|---|---|
| Weight emphasized | 500 | 500 | 500 | 700 | 500 | 700 |

Line height emphasized giống baseline trong bảng nguồn.

> **Cần kiểm tra (6):** nguồn nói emphasized "khác ở weight và line height trong một số style" nhưng bảng token đọc được cho line height trùng baseline ở cả 15 dòng. Chưa rõ style nào đổi line height. Cũng cần đối chiếu lại các weight 700 của Title Medium/Small và Label với token viewer.

### 3.4 Quy tắc sử dụng

- **Display**: chữ hoặc số lớn, ngắn, chủ yếu màn hình lớn. **Headline**: nội dung ngắn, nhấn mạnh, màn hình nhỏ. **Title**: nội dung ngắn, mức nhấn vừa (app bar, tiêu đề phụ). **Body**: đoạn văn dài. **Label**: chữ trong component (nút) và chú thích nhỏ.
- Không dùng font trang trí cho Body và Label.
- Emphasized không là mặc định trong component; đổi token baseline thành emphasized cùng style cho: selected, unread, primary button, extended FAB, selected list item, selected menu item, badge.
- Không đổi size token; được phép đổi font, line height, letter spacing, weight.
- Line height: Title/Headline/Display khoảng 1,2 x size; Body/Label khoảng 1,5 x size.
- Dùng tabular numbers khi số thay đổi liên tục.
- Màu chữ mặc định `on-surface`; `on-surface-variant` là lựa chọn phụ. Link dùng `primary` hoặc `tertiary` và có gạch chân.
- **Line height tiếng Việt**: trang Language height xếp tiếng Việt vào nhóm "Medium (~7% taller)". Mặc định nên dùng line height medium. Component có chiều cao cố định có thể không tự thích ứng, nếu bỏ qua sẽ bị chữ chồng lên nhau (dấu thanh).

> **Cần kiểm tra (7):** "~7% taller" và việc xếp tiếng Việt vào nhóm Medium chỉ có trong `typography-shape-elevation.md`; chưa có nguồn thứ hai. Cần kiểm tra bằng mắt trên thiết bị với chữ có dấu chồng (ví dụ "Ưu tiên", "Hạn hoàn thành").

### 3.5 Áp dụng cho React Native

`letterSpacing` của RN dùng đơn vị tuyệt đối nên dùng thẳng giá trị token. `fontWeight` 500 trên Android chỉ đáng tin nếu font có biến thể tương ứng; chắc chắn nhất là nạp Roboto và dùng `fontFamily` theo weight. Đặt `fontSize` và `lineHeight` theo bảng, không tự co giãn.

---

## 4. Shape

Nguồn: https://m3.material.io/styles/shape/overview-principles ; /corner-radius-scale

### 4.1 Corner radius scale (10 bậc)

| Token | Radius (dp) |
|---|---|
| None | 0 |
| Extra small | 4 |
| Small | 8 |
| Medium | 12 |
| Large | 16 |
| Large increased | 20 |
| Extra large | 28 |
| Extra large increased | 32 |
| Extra extra large | 48 |
| Full | bo tròn hết (không có số cố định) |

Ghi chú Expressive (cập nhật 05/2025): Large tăng lên 20, Extra large tăng lên 32, Extra extra large 48; Full dùng token riêng thay cho 50% kích thước.

### 4.2 Quy tắc

- Dùng nhất quán các style M3; tuỳ chỉnh cho hero moment hoặc component riêng.
- Đổi giá trị một style áp dụng cho mọi component dùng style đó; đổi style cho một component chỉ ảnh hưởng component đó.
- Không áp góc lớn hoặc full cho component chứa nhiều thông tin (card).
- **Lồng nhau**: radius trong = radius ngoài - padding (ví dụ 48 - 14 = 34). Không dùng cùng radius cho hai vật lồng nhau.
- Shape morph nên phản hồi tương tác (ví dụ button nhấn chuyển vuông hơn).
- Góc bất đối xứng dùng cho inner corner của nhóm (menu, split button, segmented).
- Ví dụ trang Buttons: round = full ở mọi size; square XS và S 12dp, M 16dp, L và XL 28dp; khi pressed XS và S 8dp, M 12dp, L và XL 16dp.

> **Cần kiểm tra (8):** `metrics.ts` dùng `radius.extraLarge = 28` và `full = 999`, không có bậc 20, 32, 48 (không dùng tới). Thang "Large = 16" là giá trị baseline; nguồn Expressive nói Large đã tăng thành 20. Ứng dụng đang theo bản 16 (Large) cho FAB, tức là baseline M3, không phải Expressive.

Áp dụng RN: `full` dùng 999 (hoặc `height / 2`) vì RN không có phần trăm cho `borderRadius`.

---

## 5. Elevation

Nguồn: https://m3.material.io/styles/elevation/overview ; /applying-elevation ; /tokens

- Elevation là khoảng cách trên trục z, đơn vị dp. Token không có shadow hay màu: mỗi nền tảng tự chọn cách vẽ.
- Có thể thể hiện bằng tonal surface color hoặc shadow. Surface tint đã deprecated, dùng các token level 0–5.
- Không đổi elevation mặc định của component; dùng ít level.

| Level | dp | Loại | Ví dụ component |
|---|---|---|---|
| 0 | 0 | Resting | App bar (không cuộn), button filled/tonal/outlined, card filled/outlined, chip, list, tabs |
| 1 | 1 | Resting | Elevated button, elevated card, elevated chip, bottom sheet, banner |
| 2 | 3 | Resting | App bar (đã cuộn), menu, navigation bar, rich tooltip |
| 3 | 6 | Resting | FAB, extended FAB, dialog, date/time picker, search |
| 4 | 8 | Chỉ cho tương tác (hover, dragged) | Không gán resting |
| 5 | 12 | Chỉ cho tương tác | Không gán resting |

- Component tăng 1 level khi tương tác (FAB hover: level 3 -> 4). Elevated button disabled có elevation 0.
- Shadow chỉ dùng khi cần tách khỏi nền hoặc nhấn mạnh tương tác. Scrim dưới modal: opacity 32%.
- Surface chồng nhau phải khác color role (xem 2.3).

> **Cần kiểm tra (9):** `components.md` ghi "elevated button mặc định 1, bằng 0 khi disabled" và `typography-shape-elevation.md` đặt elevated button ở level +1 (1dp): hai nguồn khớp. Các giá trị shadow RN trong `metrics.ts` (`shadowOpacity = 0.12 + dp * 0.01`, `shadowRadius = dp * 2`, `shadowOffset.height = dp`) là ước lượng của dự án, không từ M3.

Áp dụng RN: Android dùng `elevation` (dp); iOS dùng `shadow*`. Trên Android, nền trong suốt làm bóng đục; luôn đặt `backgroundColor` cho component có elevation.

---

## 6. Motion

Nguồn: https://m3.material.io/styles/motion/overview/how-it-works ; /specs ; /easing-and-duration/tokens-specs ; /applying-easing-and-duration ; /transitions/transition-patterns

### 6.1 Hệ thống và Expressive spring

- Motion Expressive dựa trên **spring** (stiffness, damping, initial velocity) thay cho easing + duration. Hai scheme: **expressive** (có overshoot, cho hero moment) và **standard** (ít nảy).
- Hai loại spec: **spatial** (vị trí, kích thước, hình dạng; có overshoot) và **effects** (màu, opacity; **không** overshoot). Mỗi loại có ba tốc độ: fast, default, slow.
- Chuyển spring sang cubic-bezier cho web (Expressive):

| Spring | Curve | Duration |
|---|---|---|
| fast spatial | 0.42, 1.67, 0.21, 0.90 | 350 ms |
| default spatial | 0.38, 1.21, 0.22, 1.00 | 500 ms |
| slow spatial | 0.39, 1.29, 0.35, 0.98 | 650 ms |
| fast effects | 0.31, 0.94, 0.34, 1.00 | 150 ms |
| default effects | 0.34, 0.80, 0.34, 1.00 | 200 ms |
| slow effects | 0.34, 0.88, 0.34, 1.00 | 300 ms |

- Spring thích nghi khi bị ngắt (dùng vận tốc hiện tại), tween thì giật.

### 6.2 Easing legacy (dùng cho transition)

| Token | Dùng khi | cubic-bezier |
|---|---|---|
| emphasized | Bắt đầu và kết thúc trên màn hình | path riêng (dùng 0.05, 0.7, 0.1, 1.0 làm xấp xỉ) |
| emphasized.decelerate | Vào màn hình | 0.05, 0.7, 0.1, 1.0 |
| emphasized.accelerate | Thoát vĩnh viễn | 0.3, 0.0, 0.8, 0.15 |
| standard | Tiện ích nhỏ, fallback iOS/Web | 0.2, 0.0, 0, 1.0 |
| standard.decelerate | Vào (standard) | 0, 0, 0, 1 |
| standard.accelerate | Thoát (standard) | 0.3, 0, 1, 1 |

> **Cần kiểm tra (10):** bảng nguồn gán cùng một cubic-bezier (0.05, 0.7, 0.1, 1.0) cho cả `emphasized` và `emphasized.decelerate`, trong khi ghi `emphasized` là "Path (không phải cubic đơn)". Dòng `emphasized` chỉ là xấp xỉ, không dùng làm số chuẩn.

### 6.3 Duration tokens

short1 50, short2 100, short3 150, short4 200; medium1 250, medium2 300, medium3 350, medium4 400; long1 450, long2 500, long3 550, long4 600; extra-long1 700, extra-long2 800, extra-long3 900, extra-long4 1000 (ms).

Cặp gợi ý: emphasized 500 ms (begin/end), emphasized decelerate 400 ms (enter), emphasized accelerate 200 ms (exit); standard 300 ms, standard decelerate 250 ms, standard accelerate 200 ms. Transition lớn dài hơn; enter dài hơn exit.

### 6.4 Transition patterns

Sáu pattern: container transform, forward and backward, lateral, top level, enter and exit, skeleton loaders. Shared axis, fade through, fade: không đọc được (xem Phụ lục).

### 6.5 Khi nào animate

- Enter và exit theo hướng xuất phát từ mép gần nhất; duration tương ứng kích thước vùng (nhỏ 200 ms, lớn 500 ms); tránh transition quá ngắn làm giật; chỉ một hoặc hai hero moment mỗi sản phẩm; tránh scale/z-axis cho component Android.
- Áp dụng RN: dùng `Animated.spring` cho spatial, `Animated.timing` + `Easing.bezier` cho effects, `useNativeDriver: true` cho transform/opacity. Không có số stiffness/damping đã kiểm chứng cho RN. Hiện app **chưa có animation tuỳ chỉnh**; phản hồi nhấn chỉ là đổi `opacity` (xem mục 10).

---

## 7. Layout và adaptive

Nguồn: https://m3.material.io/foundations/layout/layout-overview/overview ; /parts-of-layout ; /adaptive-design ; /breakpoints/overview ; /canonical-examples/overview ; /grids-spacing/spacing ; /density ; https://m3.material.io/styles/spacing/overview

### 7.1 Breakpoint (trước gọi là window size class)

| Breakpoint | Chiều rộng (dp) | Pane |
|---|---|---|
| Compact | dưới 600 | 1 |
| Medium | 600–839 | 1 (khuyến nghị) hoặc 2 |
| Expanded | 840–1199 | 1 hoặc 2 (khuyến nghị 2) |
| Large | 1200–1599 | 1 hoặc 2 (khuyến nghị 2) |
| Extra-large | 1600 trở lên | 1 đến 3 |

Navigation: compact dùng navigation bar; medium/expanded dùng rail; large trở lên dùng rail mở rộng. Thiết kế theo breakpoint, không theo thiết bị. Giữ 40–60 ký tự mỗi dòng.

> **Cần kiểm tra (11):** trang breakpoint đã đổi tên (05/2026: "window size classes" thành "breakpoints"; "responsive layout" thành "adaptive design") và có thêm hai bậc Large, Extra-large. Phiên bản cũ chỉ có Compact, Medium, Expanded (840+). Số dp margin, gutter, cột theo breakpoint không đọc được.

### 7.2 Spacing

- Scale 8dp; `space100` = 8dp. Giá trị lẻ cho đơn vị lồng nhau: 2, 4, 6, 10. Token Compose: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 36, 40, 48, 56, 64, 72.
- Ba loại: padding, gap, margin. Định nghĩa padding và gap trên container cha; tránh margin trên con. Gần nhau để nhóm, xa để tách.
- Density: không tự đổi theo breakpoint hay hướng xoay; chỉ khi người dùng chọn; target không dưới 48dp.

### 7.3 Touch target

- Tối thiểu **48 x 48dp** (khoảng 9mm). Icon 24dp có target 48dp. Khoảng cách giữa target >= 8dp. Pointer (chuột, bút): tối thiểu 44dp. State layer 40dp trong target 48dp.

> **Cần kiểm tra (12):** trang Density ghi "48x48 CSS pixels"; các trang khác ghi dp. Với React Native dùng dp. iOS HIG khuyến nghị 44; app theo 48.

### 7.4 Parts of layout và canonical layouts

- Thành phần: window, grid, bars, rails, panes, drag handle, rulers, safety region, margin, gap; hỗ trợ RTL (leading/trailing đảo chiều).
- **List-detail**: danh sách + chi tiết. Compact 1 pane; medium 1 hoặc 2; expanded 2. Nút back chỉ ở single-pane; trạng thái selected chỉ ở two-pane; không chọn gì thì pane chi tiết hiện empty state.
- **Supporting pane**: nội dung phụ liên quan nội dung chính (khoảng 2/3 + 1/3; expanded: pane phụ cố định 360dp).
- **Feed**: card dọc ở compact, thêm cột ở lớn hơn.
- Adaptive: show và hide, levitate, reflow; ba kiểu component thích ứng: resize, show/hide, presentation change.
- Áp dụng RN: `useWindowDimensions()` thay cho `Dimensions.get` một lần; `useSafeAreaInsets()` cho vùng safety; `start`/`end` thay cho `left`/`right` khi cần RTL.

---

## 8. Components (chỉ những thành phần liên quan tới app)

Nguồn: `docs/m3/components.md`; mỗi mục có URL dạng `https://m3.material.io/components/<tên>/overview` (cùng /specs và /guidelines). Opacity state layer và số đo chỉ có trong hình: xem Phụ lục.

### 8.1 Buttons
- **Dùng khi**: thể hiện hành động. Độ nhấn từ cao xuống thấp: elevated, filled, tonal, outlined, text. Filled tối đa một lần mỗi màn hình. Nhãn 1–3 từ, sentence case, một dòng.
- **Số đo**: cao 40dp, bo full, icon 20dp, padding ngang size S 16dp (khuyến nghị Expressive), target tối thiểu 48dp. Màu: filled `primary`/`on-primary`; tonal `secondary-container`/`on-secondary-container`; outlined viền `outline-variant`, chữ `on-surface-variant`; text chữ `primary`.
- **Trạng thái**: enabled, disabled, hovered, focused, pressed (có thể morph vuông hơn).
- **Do**: filled cho hành động chính duy nhất; text button bên phải trong dialog. **Don't**: outlined/text trên ảnh; gạch chân; xuống dòng nhãn.

### 8.2 Chips
- **Dùng khi**: nhập, chọn, lọc, gợi ý. Bốn loại: assist, filter, input, suggestion. Luôn dùng theo nhóm; không trộn chọn một và chọn nhiều; nhãn tối đa 20 ký tự; khoảng cách >= 8dp.
- **Số đo**: cao 32dp, bo 8dp, icon 18dp, padding ngang 16dp (8dp khi có icon), target 48dp. Filter chip chọn: nền `secondary-container`, chữ `on-secondary-container`, có checkmark đầu.
- **Trạng thái**: enabled, disabled, hovered, focused, pressed, dragged; elevation 0.
- **Don't**: filter chip chỉ có một lựa chọn.

### 8.3 Cards
- **Dùng khi**: nội dung và hành động của một chủ đề. Ba loại: elevated (`surface-container-low`, level 1), filled (`surface-container-highest`), outlined (`surface` + viền `outline-variant`).
- **Số đo**: bo 12dp, padding ngang 16dp, khoảng cách giữa card tối đa 8dp (theo nguồn).
- **Don't**: cuộn nội dung trong card trên mobile; chữ/icon lên ảnh không có scrim. Tối đa một swipe action.

> **Cần kiểm tra (13):** nguồn nói khoảng cách giữa các card "tối đa 8dp"; `task-card.tsx` dùng `marginBottom: spacing.md` (12dp).

### 8.4 Text fields
- **Dùng khi**: nhập văn bản; mọi field phải có label. Hai loại filled và outlined, không trộn trong một form.
- **Số đo**: cao 56dp; padding ngang 16dp (12dp có icon); khoảng cách trên supporting text 4dp.
- **Màu**: outlined viền `outline`, focus viền `primary`, label `on-surface-variant`, chữ `on-surface`. Lỗi: viền và supporting text màu lỗi; error text **thay thế** supporting text để layout không nhảy; nên có icon lỗi; mô tả cách sửa.
- **Don't**: dùng placeholder làm label; để label bị cắt.

> **Cần kiểm tra (14):** `components.md` ghi "outlined bo tròn toàn bộ", nhưng M3 thường gặp dùng 4dp (extra small) cho outlined text field và góc trên của filled. Nguồn không có số. App dùng 4dp (`radius.extraSmall`).

### 8.5 Lists
- **Dùng khi**: nhóm dọc mục chữ/icon/hành động. Chiều cao mục 56, 72 hoặc 88dp; padding trái 16dp; divider dùng `outline-variant`; một kiểu tương tác chọn mỗi mục (checkbox chọn nhiều, switch, radio). Danh sách có khung dùng khoảng cách, không dùng divider.

### 8.6 Checkbox
- Container 18dp, bo 2dp, icon 18dp, target 48dp, state layer 40dp. Trạng thái: enabled, disabled, hovered, focused, pressed, indeterminate, error. Toggle phải có hiệu lực ngay. `accessibilityRole="checkbox"` và `accessibilityState={{checked}}`.

### 8.7 App bar (trang gọi là "App bars")
- Headline không cắt; tối đa 2 hành động trailing trên mobile; khi cuộn đổi nền sang surface container (không dùng bóng). Typography: small = Title large; medium flexible = Headline medium; large flexible = Display small; search = Body large. Chiều cao không đọc được.

### 8.8 Dialogs
- Chỉ dùng cho thông tin hoặc quyết định cần xác nhận; thông báo mức thấp dùng snackbar. Bo 28dp, rộng 280–560dp, padding 24dp, nút cách nhau 8dp, nút xác nhận gần mép phải nhất; tối đa 2 hành động; không dùng nhãn "OK", "Done". Xác nhận xoá: nhãn cụ thể (ví dụ "Xoá việc"); khi có thể hoàn tác thì cân nhắc snackbar + Undo (khuyến nghị dựa trên nguyên tắc, không phải quy định trực tiếp của trang).

### 8.9 Snackbar
- Một snackbar tại một thời điểm; tối đa một hành động (text button); không có hành động thì tự tắt sau 4–10 giây tuỳ nền tảng; một đến hai dòng; đặt phía trên FAB, không che FAB. Cao 48–64dp (compact). Màu: nền `inverse-surface`, chữ `inverse-on-surface`, hành động `inverse-primary`.

### 8.10 Progress indicators
- Chờ dưới 200 ms: không hiện; 200 ms đến 5 giây: loading indicator; trên 5 giây: progress. Linear: track 4dp, active `primary`, track `secondary-container`; không dùng cho phần tử nhỏ hơn 40dp; stop indicator 4dp cho determinate.

### 8.11 Badges
- Small 6dp (bo 3dp), large cao 16dp (bo 8dp, tối đa 16x34dp, tối đa 4 ký tự); màu `error` + `on-error`; vị trí cố định góc trên của icon; ẩn badge khi điểm đến đang được chọn.

> **Cần kiểm tra (15):** FAB, search bar và segmented buttons **không** có trang riêng trong `docs/m3/components.md`. Chỉ có: FAB và search xếp level 3 (6dp) ở bảng elevation; app bar có biến thể "search" dùng Body large. Số đo FAB (56dp), search bar và segmented trong app là giá trị của dự án, chưa đối chiếu với trang M3.

---

## 9. Accessibility, states, icons, content design

Nguồn: https://m3.material.io/foundations/designing/color-contrast ; /structure ; /flow ; /elements ; /interaction/states/overview ; /state-layers ; /interaction/gestures ; /styles/icons/overview ; /applying-icons ; /design-tokens/overview ; /writing/best-practices

### 9.1 Label, role, semantics
- Label mô tả mục đích, không mô tả hình dạng ("Tìm kiếm", không "kính lúp"). Không đưa loại element vào label ("button"). Cần label cho icon button không có chữ, interactive image, visual cue (progress, lỗi). Không cần cho text không tương tác. Icon trang trí: ẩn khỏi accessibility tree.
- Ưu tiên component chuẩn của nền tảng. Gán role cho mọi element tương tác.
- RN: `accessibilityRole`, `accessibilityLabel`, `accessibilityState` đồng bộ với trạng thái visual.

### 9.2 Cử chỉ
- Tap, double tap, long press (chức năng phụ), scroll/pan, swipe, predictive back (Android), drag, pick up and move, pinch. Long press phải có cách khác tương đương (người dùng assistive tech).

### 9.3 Interaction states và state layer
- Nguồn liệt kê **6** trạng thái (không phải 7): Enabled, Disabled, Hover, Focused, Pressed, Dragged. Có thể kết hợp (ví dụ selected + hover). Chỉ một hover, focus, pressed, dragged tại một thời điểm.
- State layer: lớp bán trong suốt, **cùng màu với content**; thứ tự lớp: container, state layer, content. Kích thước 40dp trong target 48dp. Opacity theo trang state-layers: hover 0,08; focus 0,10; pressed 0,10; dragged 0,16; "disabled state layer opacity" 0,38.
- Disabled không cần đạt tương phản; không kế thừa hover.

> **Cần kiểm tra (16):** trang state-layers liệt kê "disabled state layer opacity 0,38" nhưng không nói áp cho lớp nào; `components.md` lại ghi opacity state layer của từng component là "không đọc được". Hai file nghiên cứu lệch nhau về việc đã đọc được opacity hay chưa. Bảng 0,08 / 0,10 / 0,10 / 0,16 lấy từ trang state-layers (đọc được), còn `components.md` chưa đối chiếu.

### 9.4 Iconography
- Chuẩn 24dp (live area 20x20, padding 2dp); kích thước tối ưu khác: 20, 40, 48. Material Symbols có ba style (outlined, rounded, sharp); không trộn style. Trục: weight 100–700 (tối thiểu 200 cho icon 24dp), fill 0–1 (selected thường fill 1), grade, optical size. Icon có nhãn nếu trừu tượng; navigation item bắt buộc có nhãn. Icon 24dp có target 48dp.

### 9.5 Design tokens
- Ba lớp: **reference** (`ref`, giá trị tĩnh), **system** (`sys`, vai trò, nơi theming), **component** (`comp`). Component ưu tiên trỏ tới system, không hardcode hex. Tên token: `md.<lớp>.<mục đích>`.

### 9.6 Cấu trúc, thứ tự focus, chữ
- Thứ tự đọc theo thứ tự cây element; đặt hành động quan trọng ở đầu hoặc cuối màn hình. Mở dialog thì focus vào dialog; đóng thì trả focus về trigger.
- Hỗ trợ tăng chữ tới 200% (line height và chữ co giãn, padding giữ nguyên); khi chữ lớn thì reflow hoặc cuộn dọc. Truncation: ưu tiên wrap; nếu cắt bằng ellipsis thì phải có cách xem đầy đủ.
- RN: không đặt `allowFontScaling={false}` cho chữ thường; dùng `minHeight` thay vì `height` cố định.

### 9.7 Content design
- UI text rõ ràng, theo AP Style. Nhãn nút dùng động từ cụ thể; tránh "Learn more" hay "Save" lặp lại thiếu ngữ cảnh. Alt text ngắn (tối đa 125 ký tự), không thêm "image of".
- Hướng dẫn riêng cho **error message** và **empty state**: không đọc được (Phụ lục).

---

## 10. Áp dụng cho PlannerApp

### 10.1 Bảng ánh xạ

| Phần tử M3 | App đang làm | File |
|---|---|---|
| Color roles | Baseline light scheme seed `#6750A4`, mã hex viết theo trí nhớ (trang màu không có hex). Có primary, secondary, error + container, surface, 5 surface container, outline, outline-variant, inverse-surface, inverse-on-surface, scrim. **Chỉ có** `tertiary` (không `on-tertiary`, container), không có `inverse-primary`, `surface-variant`, `shadow`. Màu ưu tiên (`priorityColors`) là palette riêng theo đề (đỏ, vàng, xanh), không phải role M3; `statusColors.overdue` = `#B3261E` | `src/theme/colors.ts` |
| Typography | 10 style (headlineSmall, titleLarge/Medium/Small, bodyLarge/Medium/Small, labelLarge/Medium/Small) đúng bảng baseline mục 3.2. Không có Display và Headline Large/Medium. Không nạp font web: chỉ dùng `fontWeight`, tức font hệ thống | `src/theme/metrics.ts` |
| Shape | `radius`: none 0, extraSmall 4, small 8, medium 12, large 16, extraLarge 28, full 999 | `src/theme/metrics.ts` |
| Elevation | Level 0, 1, 3, 6 dp (`level0` đến `level3`) qua `elevation` + `shadow*`; shadow là ước lượng | `src/theme/metrics.ts` |
| Spacing, touch target | `spacing` 4, 8, 12, 16, 24, 32; `touchTarget = 48` | `src/theme/metrics.ts` |
| Button | filled, tonal, outlined; `minHeight` 48, bo full, `paddingHorizontal` 24, icon 18, pressed = `opacity 0.7`; disabled đổi nền `surfaceContainerHighest`, chữ `onSurfaceVariant`, `opacity 0.6`; `accessibilityRole`, `accessibilityState` | `src/components/ui/button.tsx` |
| Chip (filter) | `minHeight` 40, bo 8, viền `outline`, chọn: nền `secondaryContainer` + dấu check, `accessibilityState.selected` | `src/components/ui/chip.tsx` |
| Text field | Label hiện trên ô (không nổi), `minHeight` 48, bo 4, viền `outline`; lỗi: viền `error` 2dp + `Text` lỗi ngay dưới ô (thay hint), không có icon lỗi | `src/components/ui/text-field.tsx` |
| Search bar | Nền `surfaceContainerHigh`, bo full, `minHeight` 56, icon search 24, nút xoá nhanh | `src/components/ui/search-bar.tsx` |
| Segmented buttons | Nhóm nút có góc ngoài bo full, chọn: nền `secondaryContainer` + dấu check; dùng cho sắp xếp | `src/components/ui/segmented-buttons.tsx`, `src/features/tasks/components/sort-toggle.tsx` |
| FAB (extended) | Nền `primaryContainer`, chữ `onPrimaryContainer`, cao 56, bo `large` 16, elevation level 3 (6dp), icon `add` + nhãn "Thêm việc" | `src/components/ui/fab.tsx` |
| Snackbar | Nền `inverseSurface`, chữ `inverseOnSurface`, bo 4, `minHeight` 48, tự tắt sau 2500 ms, `accessibilityLiveRegion="polite"`, một snackbar mỗi lần, tránh safe area; chưa có nút hành động | `src/components/ui/snackbar.tsx` |
| Icon | `react-native-vector-icons` font MaterialIcons (không phải Material Symbols), mặc định 20dp, màu `onSurfaceVariant` | `src/components/ui/icon.tsx` |
| Screen, safe area, keyboard | `SafeAreaView` (edges trái, phải, dưới), nền `surface`; khi cuộn bọc `KeyboardAvoidingView` + `ScrollView` | `src/components/ui/screen-container.tsx` |
| Empty/loading state | Icon 56dp + tiêu đề + mô tả; `ActivityIndicator` màu `primary` | `src/components/states/` |
| App bar | Header mặc định của native-stack, nền `surface`, chữ `onSurface` (không dựng app bar riêng) | `src/navigation/root-navigator.tsx` |
| Card | `TaskCard`: nền `surfaceContainerLow`, bo 12, padding 12, elevation level 1 (elevated card), tiêu đề `titleMedium`, hàng meta `bodyMedium`, nhấn giữ để xoá | `src/features/tasks/components/task-card.tsx` |
| Badge | Nhãn ưu tiên (nền `priorityColors`), nhãn "Quá hạn" (`error` + `onError`), bo 8, chữ `labelMedium`, kèm icon 14 | `src/features/tasks/components/priority-badge.tsx`, `overdue-badge.tsx` |
| Checkbox | `Pressable` role checkbox; hộp 24dp, bo 4, viền `outline`; chọn: nền `primary` + dấu check; vùng chạm 40dp + `hitSlop` 8 | `src/features/tasks/components/task-checkbox.tsx` |
| Progress | Track 8dp bằng `View` (nền `surfaceContainerHighest`, fill `primary`) và chữ tiến độ | `src/features/tasks/components/progress-header.tsx` |
| Icon và màu danh mục | Bảng riêng theo danh mục, mã hex nằm ngoài theme | `src/features/tasks/category-meta.ts` |
| Dialog xoá | `Alert` của hệ điều hành qua `confirmDestructive`, không dựng dialog M3 | `src/lib/confirm.ts` |

### 10.2 Sai lệch có chủ đích so với M3

- **Không có web font**: dùng `fontWeight`, không nạp Roboto; weight 500 phụ thuộc font hệ thống.
- **FAB** có nhãn "Thêm việc" kèm icon `add`, `accessibilityLabel="+ Thêm việc"`, thay vì chữ "+ Thêm việc" nguyên văn của đề; hiển thị bằng icon cho nhất quán với extended FAB.
- **Không có dark theme** (chỉ light), không `useColorScheme`.
- **Không có layout adaptive**: không dùng `useWindowDimensions`, không list-detail hai cột; chỉ một cột ở mọi cỡ màn hình.
- **Phản hồi nhấn** bằng `opacity` (0.6 đến 0.85) thay cho state layer; chưa có hover, focus, dragged, ripple.
- **Kích thước vượt chuẩn M3**: button `minHeight` 48 (chuẩn 40), chip 40 (chuẩn 32), checkbox 24 (chuẩn 18) để đạt target 48dp.
- **Viền chip, button outlined** dùng `outline` thay vì `outline-variant` (xem Cần kiểm tra 4).
- **Không animation tuỳ chỉnh**: không spring, không container transform; dùng animation mặc định của native-stack.
- **Không có Alert thay thế snackbar-undo** cho xoá: đề bắt buộc Alert xác nhận.
- **Tertiary** chỉ có một giá trị; không dùng onTertiary, container.
- **Màu danh mục** (`#00639B`, `#B3261E`, `#7D5260`, `#6750A4`, `#79747E`) hardcode trong `category-meta.ts`, không qua `colors.ts`.
- **Phụ thuộc ngược nhẹ**: `theme/colors.ts` import kiểu `Priority` từ `features/tasks/types` (xem [architecture.md](architecture.md)).

### 10.3 Checklist review thiết kế

- [ ] **Tương phản**: chữ thường >= 4.5:1; chữ lớn, icon có nghĩa, viền >= 3:1. Kiểm tra riêng ba cặp `priorityColors` và `statusColors.overdue`.
- [ ] **Target 48dp**: mọi phần tử bấm được >= 48x48 (kể cả `hitSlop`); khoảng cách giữa target >= 8dp.
- [ ] **Trạng thái**: pressed, disabled, selected, error phân biệt được; disabled có thêm tín hiệu ngoài màu; `accessibilityState` khớp.
- [ ] **Lỗi nhập**: viền đỏ và thông báo ngay dưới ô; mô tả cách sửa.
- [ ] **Empty state**: có tiêu đề và mô tả cho danh sách rỗng và kết quả tìm kiếm rỗng.
- [ ] **Safe area**: nội dung và FAB, snackbar không đè lên tai thỏ, thanh điều hướng.
- [ ] **Bàn phím**: không che ô nhập; `keyboardType` đúng (`numeric` cho ngày).
- [ ] **Chữ lớn**: tăng cỡ chữ hệ thống không làm mất nội dung, `numberOfLines` kèm cách xem đủ.
- [ ] **Chữ có dấu**: kiểm tra line height với tiếng Việt (Cần kiểm tra 7).
- [ ] **Token**: không hex trong JSX; màu lấy từ `colors.ts`, kích thước từ `metrics.ts`.

---

## Phụ lục: Phần chưa đọc được

Các mục dưới đây được ghi "không đọc được" trong file nghiên cứu. Không có giá trị nào được điền thay.

**Color**
- Không có file nghiên cứu riêng cho màu; mã hex của vai trò (trang chỉ có tên token); số vai trò chính xác (xem Cần kiểm tra 3).

**Typography, shape, elevation**
- Số liệu shadow cụ thể cho từng level elevation (nguồn nói token không có shadow).

**Motion**
- Shared axis, fade through, fade (trang transition-patterns không chứa).
- Số stiffness, damping của preset Expressive và Standard cho RN.
- Danh sách `/blog` chính và bài announcement gốc (điều hướng bị chuyển hướng); trang `/styles/motion/easing-and-duration` (overview) đọc được qua đường dẫn con.
- Không có trang nào liệt kê rõ "không animate khi nào".

**Layout**
- Số dp margin, gutter, cột theo từng breakpoint (`/foundations/layout/grids-spacing/grids` không hiển thị số trong text).
- `/foundations/layout/understanding-layout/margins-and-columns` không tồn tại.

**Components**
- Opacity state layer của từng component (bảng token không hiện trong text). Lưu ý: trang `/foundations/interaction/states/state-layers` đã đọc được bảng 0,08/0,10/0,10/0,16 ở mục 9.3.
- Số đo nằm trong hình: app bar (chiều cao, padding), snackbar (radius), buttons (bảng padding XS đến XL), progress (kích thước linear/circular), lists (chiều cao chi tiết), text fields (corner radius filled).
- Trạng thái riêng của app bar, dialog, snackbar, badge, progress.
- **Empty states**: không tìm thấy trang nào.
- Không có trang riêng cho FAB, search bar, segmented buttons trong `components.md`.

**Accessibility, states, icons, content design**
- `/foundations/accessible-design/accessibility-basics` và `/patterns`: 404.
- Hướng dẫn riêng về **error message**, **empty state**, giọng văn (tone), độ dài nhãn nút.
- Trang `/foundations/interaction/states/overview` liệt kê **6** trạng thái (không phải 7): Enabled, Disabled, Hover, Focused, Pressed, Dragged.
- Cách React Native nhận Material Symbols variable font (weight, fill, grade): chưa xác minh. App dùng MaterialIcons font cũ.
