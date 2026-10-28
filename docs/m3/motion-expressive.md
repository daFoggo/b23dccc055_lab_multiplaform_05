# Material Design 3 Motion và M3 Expressive (cho React Native, không dùng UI library)

Tài liệu này chỉ chứa thông tin đã đọc trực tiếp từ các trang m3.material.io được tải qua trình duyệt (ngày 2026-10-28). Mọi chỗ không đọc được được ghi rõ là **không đọc được**. Không có số liệu nào lấy từ trí nhớ.

Phạm vi triển khai: chỉ dùng `Animated` (built-in) và `Pressable` cho phản hồi nhấn. Không dùng Reanimated.

## Ghi chú về nguồn

- Trang "Easing and duration" (`/styles/motion/easing-and-duration`) được xác nhận qua URL: nội dung đã đọc từ `/easing-and-duration/applying-easing-and-duration` và `/easing-and-duration/tokens-specs`.
- Trang `/styles/motion/transitions/transition-patterns` ghi rõ: "M3 transitions use the legacy easing and duration system". Trang này không chứa các pattern **shared axis**, **fade through** và **fade**.
- Trang `/get-started` ghi "15 new or updated components", trong khi blog M3 Expressive ghi "Fourteen new or updated components". Tài liệu này không chọn một con số.
- Trang Expressive chính trên blog (`/blog/...`) không tìm thấy trực tiếp bằng điều hướng; đã đọc hai bài blog liên quan do WebSearch trả về.

---

## 1. Tổng quan: hệ thống motion physics (How it works)

- Motion trong M3 Expressive dựa trên **motion physics** (spring) thay cho easing + duration. Trang ghi rõ: "The physics system is replacing the previous system based on easing and duration."
- Hai preset motion scheme: **expressive** (khuyến nghị cho đa số trường hợp, đặc biệt hero moment và key interaction; có overshoot tạo độ nảy) và **standard** (ít nảy hơn, dành cho sản phẩm mang tính tiện ích).
- Một spring gồm 3 thuộc tính: stiffness, damping, initial velocity.
- Mọi motion của component được điều khiển bởi hai token: `expressive fast spatial` và `expressive fast effects`.

**Áp dụng cho React Native**
- Không có motion scheme sẵn cho RN. Cách làm thực tế: tạo một object cấu hình tập trung (ví dụ `motion.ts`) chứa các spec spring/timing, rồi mọi component import từ đó. Đây là tương đương ý tưởng "định nghĩa một lần, dùng toàn app" trong blog.
- Dùng `Animated.spring` cho chuyển động spatial và `Animated.timing` (với `Easing.bezier`) cho effects như opacity/màu.

Nguồn: https://m3.material.io/styles/motion/overview/how-it-works

---

## 2. Easing curves (bộ easing legacy, dùng cho transition)

Bộ easing này được trang ghi là "no longer maintained" nhưng vẫn dùng cho transition. Giá trị lấy từ bảng "Tokens & specs".

| Token | Dùng khi | CSS cubic-bezier | Android PathInterpolator | Ghi chú |
|---|---|---|---|---|
| `md.sys.motion.easing.emphasized` | Bắt đầu và kết thúc trên màn hình | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | Path (không phải cubic đơn) | Platform iOS/Web: dùng Standard làm fallback |
| `md.sys.motion.easing.emphasized.decelerate` | Vào màn hình | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | `PathInterpolator(0.05f, 0.7f, 0.1f, 1f)` | Bắt đầu vận tốc đỉnh, dừng êm |
| `md.sys.motion.easing.emphasized.accelerate` | Thoát vĩnh viễn | `cubic-bezier(0.3, 0.0, 0.8, 0.15)` | `PathInterpolator(0.3f, 0f, 0.8f, 0.15f)` | Kết thúc ở vận tốc đỉnh |
| `md.sys.motion.easing.standard` | Transition nhỏ, mang tính tiện ích | `cubic-bezier(0.2, 0.0, 0, 1.0)` | `PathInterpolator(0.2f, 0f, 0f, 1f)` | Fallback cho iOS và Web |
| `md.sys.motion.easing.standard.decelerate` | Vào màn hình (standard) | `cubic-bezier(0, 0, 0, 1)` | `PathInterpolator(0f, 0f, 0f, 1f)` | |
| `md.sys.motion.easing.standard.accelerate` | Thoát (standard) | `cubic-bezier(0.3, 0, 1, 1)` | `PathInterpolator(0.3f, 0f, 1f, 1f)` | |

Chọn easing theo hành vi (trang "Applying easing and duration"):
- Begin and end on screen: Emphasized.
- Enter the screen: Emphasized decelerate.
- Exit permanently: Emphasized accelerate.
- Exit temporarily (ví dụ drawer quay lại): Emphasized.
- Utility nhỏ, và là fallback cho iOS/Web: Standard.

**Áp dụng cho React Native**
- Built-in `Easing.bezier(x1, y1, x2, y2)` có sẵn trong `react-native`, dùng trực tiếp với `Animated.timing`:
  - Emphasized: `Easing.bezier(0.05, 0.7, 0.1, 1.0)`
  - Emphasized decelerate (vào): `Easing.bezier(0.05, 0.7, 0.1, 1.0)`
  - Emphasized accelerate (thoát vĩnh viễn): `Easing.bezier(0.3, 0.0, 0.8, 0.15)`
  - Standard: `Easing.bezier(0.2, 0.0, 0, 1.0)`
  - Standard decelerate: `Easing.bezier(0, 0, 0, 1)`
  - Standard accelerate: `Easing.bezier(0.3, 0, 1, 1)`
- Đây chỉ là giá trị cubic-bezier từ spec; chưa kiểm chứng cảm giác trên thiết bị.

Nguồn: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs ; https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration

---

## 3. Duration tokens

| Nhóm | Token | Giá trị |
|---|---|---|
| Short | `md.sys.motion.duration.short1` | 50 ms |
| Short | `md.sys.motion.duration.short2` | 100 ms |
| Short | `md.sys.motion.duration.short3` | 150 ms |
| Short | `md.sys.motion.duration.short4` | 200 ms |
| Medium | `md.sys.motion.duration.medium1` | 250 ms |
| Medium | `md.sys.motion.duration.medium2` | 300 ms |
| Medium | `md.sys.motion.duration.medium3` | 350 ms |
| Medium | `md.sys.motion.duration.medium4` | 400 ms |
| Long | `md.sys.motion.duration.long1` | 450 ms |
| Long | `md.sys.motion.duration.long2` | 500 ms |
| Long | `md.sys.motion.duration.long3` | 550 ms |
| Long | `md.sys.motion.duration.long4` | 600 ms |
| Extra long | `md.sys.motion.duration.extra-long1` | 700 ms |
| Extra long | `md.sys.motion.duration.extra-long2` | 800 ms |
| Extra long | `md.sys.motion.duration.extra-long3` | 900 ms |
| Extra long | `md.sys.motion.duration.extra-long4` | 1000 ms |

Cặp gợi ý mặc định (trang "Suggested easing and duration pairs"):
- Emphasized 500 ms: begin và end on screen.
- Emphasized decelerate 400 ms: enter.
- Emphasized accelerate 200 ms: exit.
- Standard 300 ms: begin và end on screen.
- Standard decelerate 250 ms: enter.
- Standard accelerate 200 ms: exit.

Quy tắc: transition lớn dùng duration dài hơn; enter dài hơn exit; exit/dismiss ngắn hơn vì cần ít sự chú ý hơn.

**Áp dụng cho React Native**
- Khai báo duration như hằng số: `SHORT = 200`, `MEDIUM = 400`, `LONG = 500`, `EXTRA_LONG = 1000` (ms).
- Enter dùng ~400 ms với `Easing.bezier(0.05, 0.7, 0.1, 1.0)`, exit dùng ~200 ms với `Easing.bezier(0.3, 0.0, 0.8, 0.15)`.

Nguồn: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs ; https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration

---

## 4. Transition patterns

Trang "Transition patterns" liệt kê sáu pattern: **Container transform**, **Forward and backward**, **Lateral**, **Top level**, **Enter and exit**, **Skeleton loaders**.

- **Container transform**: một phần tử biến hình để lộ chi tiết (ví dụ Card mở thành màn hình chi tiết). Dùng cho card, list, gallery, search, sheet, FAB, chip. Tạo quan hệ mạnh nhất giữa hai màn hình, được coi là biểu cảm nhất.
- **Forward and backward**: điều hướng giữa các cấp hierarchy (ví dụ inbox sang thread). Trang ghi: Android dùng fade khi trượt ngang; iOS dùng parallax. Cả hai đều giảm lượng chuyển động.
- **Lateral**: điều hướng giữa nội dung ngang hàng (tab, carousel, gallery). Các phần tử trượt cùng nhau, không dùng fade hay parallax.
- **Top level**: chuyển giữa các destination cấp cao nhất (navigation bar/rail/drawer). Màn cũ fade out nhanh rồi màn mới fade in; không dùng persistent element.
- **Enter and exit**: đưa component vào hoặc ra khỏi màn hình. Trong màn hình: dialog, menu, snackbar, tooltip. Ngoài biên màn hình: nav drawer, bottom sheet, app bar khi scroll. Hướng vào lấy từ vị trí trên màn hình (menu ở trên mở xuống, snackbar ở dưới mở lên).
- **Skeleton loaders**: placeholder khi đang tải. Có hiệu ứng pulse nhẹ từ trên-trái xuống dưới-phải; khi có dữ liệu thì nội dung fade in nhanh đè lên skeleton.

Trang ghi rõ: transition "should be the top priority for a strong motion implementation".

**Shared axis, fade through, fade**: **không đọc được**. Các trang đã tải không chứa nội dung về ba pattern này. Không suy diễn từ trí nhớ.

**Áp dụng cho React Native**
- Container transform: dùng `Animated.timing` hoặc `Animated.spring` cho `translateX/translateY/scale` của một View, cộng `Animated.timing` cho opacity. Đây là phần khó nhất; với Pressable + Animated không có shared element tự động, cần tự tính vị trí.
- Forward/backward và lateral: `Animated.timing` trên `translateX` của container màn hình, dùng `useNativeDriver: true` (chỉ transform và opacity).
- Top level: fade out rồi fade in bằng `Animated.timing` trên `opacity`.
- Enter/exit: `translateY` từ mép gần nhất (bottom sheet lên từ dưới) kết hợp opacity.
- Skeleton: `Animated.loop` với `Animated.sequence` trên opacity.

Nguồn: https://m3.material.io/styles/motion/transitions/transition-patterns

---

## 5. Spring-based motion trong Expressive (spatial và effects)

Hai loại spec:
- **Spatial**: thay đổi vị trí, hướng, kích thước, hình dạng (x, y, rotation, size, bo góc). Spring **overshoot** rồi nảy về giá trị đích.
- **Effects**: màu, opacity. **Không overshoot**.

Ba tốc độ cho mỗi loại: **fast**, **default**, **slow**.

| Tốc độ | Ví dụ spatial | Ví dụ effects |
|---|---|---|
| Default | Phần lớn màn hình: bottom sheet, expanded navigation rail | Opacity nội dung trong navigation rail |
| Fast | Component nhỏ: switch, button | Đổi màu handle của switch |
| Slow | Animation toàn màn hình | Làm mới nội dung toàn màn hình |

Bảng chuyển spring sang cubic-bezier (cho Web, trang "Web: Convert springs to curves"). Các tham số có y > 1 là overshoot.

| Spring (Expressive) | Curve | Duration |
|---|---|---|
| fast spatial | 0.42, 1.67, 0.21, 0.90 | 350 ms |
| default spatial | 0.38, 1.21, 0.22, 1.00 | 500 ms |
| slow spatial | 0.39, 1.29, 0.35, 0.98 | 650 ms |
| fast effects | 0.31, 0.94, 0.34, 1.00 | 150 ms |
| default effects | 0.34, 0.80, 0.34, 1.00 | 200 ms |
| slow effects | 0.34, 0.88, 0.34, 1.00 | 300 ms |

Standard (để so sánh): spatial 0.27, 1.06, 0.18, 1.00 với duration 350/500/750 ms (fast/default/slow); effects giống Expressive.

Tại sao dùng spring: spring tiếp nối tự nhiên khi bị ngắt và retarget (dùng vận tốc hiện tại), trong khi tween thì giật. Spring cũng thích nghi theo thiết bị vì được mô tả bằng damping và stiffness, không bằng thời gian cố định.

Preset Expressive và Standard là giá trị cụ thể cho Compose. Trang Compose không ghi số stiffness/damping của preset; chỉ có ví dụ tùy chỉnh trong blog (xem phần 7).

**Áp dụng cho React Native**
- Spatial: `Animated.spring(value, { toValue, useNativeDriver: true, stiffness, damping, mass })` trên `translateX/translateY/scale`. Tham số stiffness/damping của RN khác đơn vị với Compose (Compose dùng dampingRatio), nên **chưa có số preset đã kiểm chứng cho RN**; cần tự tinh chỉnh trên thiết bị.
- Effects: `Animated.timing` với `Easing.bezier(0.31, 0.94, 0.34, 1.00)` (fast) hoặc `Easing.bezier(0.34, 0.80, 0.34, 1.00)` (default). Opacity và màu không overshoot.
- Không dùng Reanimated; `useNativeDriver: true` chỉ áp dụng cho transform và opacity.

Nguồn: https://m3.material.io/styles/motion/overview/specs ; https://m3.material.io/styles/motion/overview/how-it-works

---

## 6. Khi nào nên animate và khi nào không

Các trang đã đọc có nêu:
- Chuyển động phải phản ánh quan hệ không gian: enter và exit theo hướng xuất phát từ mép màn hình gần component nhất; nav drawer vào từ trái; bottom sheet vào từ dưới (vị trí dễ chạm).
- Duration phải tương ứng với kích thước: vùng nhỏ thì ngắn (200 ms), vùng lớn thì dài (500 ms).
- Transition không được quá ngắn đến mức giật: trang ghi "Avoid transitions with such a short duration they become jarring".
- Tránh scale và chuyển động z-axis đối với Android component, vì chúng ngụ ý thay đổi elevation, không khớp với mô hình elevation giảm dần của M3.
- Skeleton loader dùng để giảm độ trễ cảm nhận và giữ layout ổn định khi tải.
- Persistent element (container, hero image) chỉ nên dùng trong container transform; top-level navigation không dùng persistent element để không ngụ ý quan hệ giữa các màn hình không liên quan.
- Hero moment: "Stick to one or two hero moments in your product".

**Không có** trang nào đã đọc có danh sách rõ ràng "không animate trong trường hợp X". Mục này không được điền thêm từ trí nhớ.

**Áp dụng cho React Native**
- Animate: phản hồi nhấn (Pressable), mở/đóng sheet, chuyển màn hình, skeleton khi tải.
- Không animate: thao tác lặp lại nhiều lần trong danh sách, và mọi motion dài hơn 1000 ms (extra-long chỉ dùng cho ambient, không do người dùng kích hoạt).
- Với Pressable: phản hồi nhấn bằng `Animated.spring` scale nhỏ (spatial) và đổi opacity (effects); trang Buttons mô tả shape morph khi nhấn (xem mục dưới).

Nguồn: https://m3.material.io/styles/motion/transitions/transition-patterns ; https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration ; https://m3.material.io/components/buttons/specs

---

## 7. M3 Expressive bổ sung gì

- Expressive **không phải** phiên bản mới của M3: "M3 Expressive isn't a new version of the system. We're not deprecating M3, and this isn't 'M4.'" (blog)
- Motion physics (spring) thay cho easing + duration ở mức component.
- Hai motion scheme: expressive (có bounce) và standard (ít bounce).
- Shape: thư viện 35 hình, và shape morph tích hợp sẵn.
- Typography: emphasized text styles (variable font).
- Color: mở rộng bảng màu; các role được ánh xạ mới.
- Component: "Fourteen new or updated components" (blog) hoặc "15" (get-started). Danh sách blog gồm App bars, Button groups (new), Common buttons, Extended FAB, FAB menu (new), FABs, Icon buttons, Loading indicator (new), Navigation bar, Navigation rail, Progress indicators, Sliders, Split button (new), Toolbars (new).
- Button: shape morph khi nhấn và khi chọn (toggle); kích thước XS/S/M/L/XL.
- Mô hình thiết kế: "Expressive tactics" gồm shape, màu, typography, containment, motion, component flexibility, hero moment.
- Ví dụ code blog (Compose, chỉ tham khảo): spring với `dampingRatio = 0.6f, stiffness = 700f` cho spatial default; `dampingRatio = Spring.DampingRatioNoBouncy, stiffness = 1600f` cho effects default.

**Áp dụng cho React Native**
- Không có thư viện Expressive cho RN; chỉ áp dụng được phần motion, shape morph (dùng `borderRadius` animate bằng `Animated.timing` nếu không dùng `useNativeDriver`), và thang màu/typography tự định nghĩa.
- Các giá trị spring của Compose không thể dùng nguyên văn trong RN; phải chuyển đổi và kiểm chứng.

Nguồn: https://m3.material.io/blog/building-with-m3-expressive ; https://m3.material.io/blog/m3-expressive-motion-theming ; https://m3.material.io/get-started ; https://m3.material.io/components/buttons/overview

---

## Danh sách nguồn đã đọc thành công

- https://m3.material.io/styles/motion/overview/how-it-works
- https://m3.material.io/styles/motion/overview/specs
- https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration
- https://m3.material.io/styles/motion/transitions/transition-patterns
- https://m3.material.io/blog/building-with-m3-expressive
- https://m3.material.io/blog/m3-expressive-motion-theming
- https://m3.material.io/get-started
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/buttons/specs (đọc trước đó trong phiên; dùng cho shape morph)

## Không đọc được

- Shared axis, fade through, fade: không có trong trang transition-patterns đã đọc.
- Số stiffness/damping của preset Expressive và Standard cho RN: không có trang nào đã đọc công bố.
- Bộ trang `/blog` chính (danh sách) và bài blog announcement gốc: điều hướng bị chuyển hướng lại sang trang khác; chỉ đọc được hai bài qua URL từ WebSearch.
- Trang `/styles/motion/easing-and-duration` (overview) lúc đầu bị chuyển sang trang khác, sau đó đọc được ở đường dẫn `/applying-easing-and-duration`.
