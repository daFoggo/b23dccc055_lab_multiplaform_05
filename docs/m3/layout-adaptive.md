# Material Design 3: Layout và Adaptive Design (cho React Native, không dùng UI library)

Tài liệu tóm tắt các chuẩn layout và adaptive của Material Design 3 (M3), kèm phần áp dụng cho React Native (RN) thuần.

## Ghi chú nguồn và trạng thái đọc

- Các URL trong yêu cầu ban đầu đã được m3.material.io chuyển hướng sang cấu trúc mới (tháng 5/2026 trang ghi nhận đổi tên: "window size classes" thành "breakpoints", "responsive layout" thành "adaptive design"). Ánh xạ thực tế đã đọc:
  - `/foundations/layout/understanding-layout/overview` -> `/foundations/layout/layout-overview/overview`
  - `/foundations/layout/understanding-layout/parts-of-layout` -> `/foundations/layout/layout-overview/parts-of-layout`
  - `/foundations/layout/understanding-layout/spacing` -> `/foundations/layout/grids-spacing/spacing`
  - `/foundations/layout/applying-layout/window-size-classes` -> `/foundations/layout/breakpoints/overview`
  - `/foundations/layout/canonical-layouts/overview` -> `/foundations/layout/canonical-examples/overview`
  - `/foundations/adaptive-design/overview` -> `/foundations/layout/layout-overview/adaptive-design`
  - `/foundations/layout/understanding-layout/density` -> `/foundations/layout/grids-spacing/density`
- `/foundations/layout/understanding-layout/margins-and-columns`: không tồn tại; nội dung margin/column nằm ở `/foundations/layout/grids-spacing/grids` (đã đọc, nhưng trang không liệt kê số dp margin/gutter/column theo từng breakpoint).
- Bảng số dp margin, gutter, số cột theo từng breakpoint: **không đọc được** (trang không hiển thị giá trị số trong nội dung text đã lấy).
- Các phần "Áp dụng cho React Native" là suy luận của người viết tài liệu từ các nguyên tắc M3, không phải nội dung nguồn. Các API RN được nêu là kiến thức RN chung, chưa đối chiếu với tài liệu M3.
- Bộ token spacing trong `/styles/spacing/tokens` ghi rõ: "The spacing system tokens are only used on Jetpack Compose." Dùng làm tham chiếu giá trị, không phải API RN.

---

## 1. Breakpoints (trước gọi là window size classes)

Nguồn: https://m3.material.io/foundations/layout/breakpoints/overview

| Breakpoint | Chiều rộng (dp) | Thiết bị thường gặp |
|---|---|---|
| Compact | dưới 600dp | Điện thoại dọc |
| Medium | 600–839dp | Tablet dọc, foldable dọc (mở) |
| Expanded | 840–1199dp | Điện thoại ngang, tablet ngang |
| Large | 1200–1599dp | Desktop |
| Extra-large | 1600dp trở lên | Desktop, monitor ultra-wide |

- M3 khuyến nghị thiết kế theo breakpoint, không theo thiết bị cụ thể, vì không gian cửa sổ thay đổi theo multi-window, gập/mở foldable và xoay màn hình.
- Breakpoint chiều cao (height breakpoints: compact, medium, expanded) chỉ có trên Android. Trang nói hiếm khi cần, vì nội dung chủ yếu cuộn dọc.
- Số pane theo breakpoint (trang Breakpoints, bảng "Panes"):
  - Compact: 1 pane
  - Medium: 1 (khuyến nghị) hoặc 2
  - Expanded: 1 hoặc 2 (khuyến nghị 2)
  - Large: 1 hoặc 2 (khuyến nghị 2)
  - Extra-large: 1 đến 3 (khuyến nghị)
- Navigation theo breakpoint: Compact dùng navigation bar; Medium và Expanded dùng navigation rail (collapsed); Large và Extra-large dùng modal hoặc standard expanded navigation rail.
- Thay đổi khi chuyển breakpoint, theo 5 câu hỏi của M3: hiển thị gì thêm (reveal), chia màn hình thế nào (divide), resize gì, reposition gì, swap component nào. Chỉ swap khi hai component tương đương về chức năng (ví dụ navigation bar <-> navigation rail; không đổi button thành menu).
- Trang khuyến nghị giữ 40–60 ký tự mỗi dòng ở mọi breakpoint bằng cách điều chỉnh margin và type style.

### Margin, gutter, cột theo breakpoint

- Trang Grids (`/foundations/layout/grids-spacing/grids`) nói số cột, độ rộng và khoảng cách cột đổi theo breakpoint; compact dùng ít cột hơn, expanded trở lên thêm cột. **Số dp cụ thể: không đọc được.**

### Áp dụng cho React Native

- Lấy kích thước cửa sổ bằng `useWindowDimensions()` (cập nhật khi xoay màn hình, multi-window, foldable). Không dùng `Dimensions.get('window')` một lần khi khởi tạo vì không cập nhật.
- Hàm phân loại breakpoint, ví dụ:
  ```ts
  export type Breakpoint = 'compact' | 'medium' | 'expanded' | 'large' | 'xlarge';
  export function getBreakpoint(width: number): Breakpoint {
    if (width < 600) return 'compact';
    if (width < 840) return 'medium';
    if (width < 1200) return 'expanded';
    if (width < 1600) return 'large';
    return 'xlarge';
  }
  ```
- Dùng `width` (không dùng height) để chọn số pane và navigation. Phone RN thường là compact khi dọc, expanded khi ngang, nên cần đổi navigation khi xoay.
- Nguồn: https://m3.material.io/foundations/layout/breakpoints/overview

---

## 2. Spacing scale và baseline grid

Nguồn: https://m3.material.io/styles/spacing/overview , https://m3.material.io/styles/spacing/tokens , https://m3.material.io/foundations/layout/grids-spacing/spacing

- Hệ spacing dựa trên **scale 8dp**; `space100` = 8dp là đơn vị baseline.
- Các giá trị chính là bội số của 8dp. Giá trị lẻ được phép cho các đơn vị lồng nhau: 2dp, 4dp, 6dp, 10dp.
- Bộ token hệ thống (Compose): space0 0dp, space25 2dp, space50 4dp, space75 6dp, space100 8dp, space125 10dp, space150 12dp, space175 14dp, space200 16dp, space250 20dp, space300 24dp, space400 32dp, space450 36dp, space500 40dp, space600 48dp, space700 56dp, space800 64dp, space900 72dp.
- Ba loại spacing: padding (trong phần tử), gap (giữa các phần tử trong container), margin (ngoài phần tử).
- Quy tắc: định nghĩa padding và gap trên container cha để sắp xếp mọi phần tử con. Tránh margin trên phần tử con vì không đồng nhất và tốn token. Margin chỉ dùng cho khoảng cách vượt quá padding của container cha hoặc ở layout.
- Ví dụ M3 (search container): padding dọc 8dp, gap ngang 8dp, margin ngang 24dp (12dp khi focus).
- Quy tắc nhóm (spacing để nhóm nội dung, trang Grids & spacing): khoảng cách gần hơn để nhóm phần tử liên quan; khoảng cách lớn hơn để tách phần không liên quan. Các phần tử tương tự nên dùng cùng spacing và kích thước. Ví dụ: ảnh và caption đặt gần nhau.
- Desktop có thể dùng spacing rộng hơn mobile.
- Mật độ (density): khoảng cách có thể giảm khi cần hiển thị nhiều thông tin (bảng, danh sách). Không tự đổi density theo breakpoint hoặc hướng xoay; chỉ đổi khi người dùng chọn.

### Áp dụng cho React Native

- Tạo file token, ví dụ `theme/spacing.ts`, dùng đúng scale trên:
  ```ts
  export const space = {
    s0: 0, s2: 2, s4: 4, s6: 6, s8: 8, s10: 10, s12: 12, s14: 14, s16: 16,
    s20: 20, s24: 24, s32: 32, s40: 40, s48: 48, s56: 56, s64: 64, s72: 72,
  } as const;
  ```
- Quy ước: chỉ dùng giá trị trong scale; padding và gap đặt trên `View` cha; hạn chế `margin` trên con. RN hỗ trợ `gap` trong Flexbox (có từ RN 0.71), nên dùng `gap` thay cho margin giữa các phần tử con (kiến thức RN, không từ M3).
- Padding ngang màn hình thường là s16 hoặc s24 (theo breakpoint); chọn theo `getBreakpoint` ở mục 1.

---

## 3. Parts of layout (cấu trúc layout)

Nguồn: https://m3.material.io/foundations/layout/layout-overview/parts-of-layout , https://m3.material.io/foundations/layout/layout-overview/overview , https://m3.material.io/foundations/layout/grids-spacing/grids

Các thành phần chính:

- **Window**: khung chứa app; có thể nhiều window cùng lúc (multi-window).
- **Grid**: nền tảng cho mọi layout; nhóm nội dung theo cột, áp dụng spacing nhất quán, tạo focal point cho hành động chính.
- **Bars**: khung ngoài màn hình để điều hướng. Thường là app bar (trên) và bottom navigation bar (dưới). App bar có mô tả màn hình và 1–2 hành động thiết yếu (tìm kiếm, quay lại).
- **Rails**: vùng biên quanh pane, chứa navigation rail, toolbar, FAB, chat input. Trên mobile, rail có thể chứa toolbar; trên desktop, chứa navigation rail.
- **Panes**: phần lớn layout. Một layout có 1–3 pane với độ rộng khác nhau, thay đổi theo breakpoint và ngôn ngữ. Pane có thể là fixed, flexible, floating hoặc semi-permanent.
- **Drag handle**: thanh kéo để đổi kích thước pane (flexible) hoặc thu/mở pane (fixed).
- **Rulers**: bộ đường căn chỉnh toàn cục (margin, bar/safety, title, content) để căn nhất quán giữa các màn hình.
- **Safety region**: vùng dành cho UI hệ thống (status bar, gesture bar), không đặt nội dung tương tác vào đó.
- **Margin**: khoảng cách từ mép màn hình tới phần tử bên trong.
- **Gap**: khoảng cách giữa các phần tử trong container.
- **Bidirectionality (RTL)**: navigation chuyển sang bên phải; leading và trailing đảo chiều.

### Áp dụng cho React Native

- Dựng layout theo khung: bar trên cùng (header), vùng pane chính, bar dưới (tab bar). Mỗi vùng có safe area riêng.
- Safe area: áp dụng cho vùng safety. Trên RN, dùng `useSafeAreaInsets()` từ `react-native-safe-area-context` (thư viện này không phải UI library, nhưng là một dependency; kiến thức RN, không từ M3). `SafeAreaView` của RN chỉ có tác dụng trên iOS.
- Với RTL: dùng `I18nManager.isRTL` và đặt thuộc tính `start`/`end` (nếu có) thay cho `left`/`right` để leading và trailing đổi chiều đúng.
- Nguồn: các trang trên.

---

## 4. Canonical layouts (layout mẫu chuẩn)

Nguồn chung: https://m3.material.io/foundations/layout/canonical-examples/overview

M3 có ba canonical layout: feed, list-detail, supporting pane. Mỗi layout có cấu hình compact, medium, expanded.

### 4.1 List-detail

Nguồn: https://m3.material.io/foundations/layout/canonical-examples/list-detail

- Dùng khi cần xem danh sách có thể duyệt và chi tiết của từng mục (ví dụ tin nhắn, file, email, cài đặt).
- Số pane theo breakpoint:
  - Compact (0–599): 1 pane
  - Medium (600–839): 1 (khuyến nghị) hoặc 2
  - Expanded (840+): 2 pane
  - Large và extra-large: 2 pane
- Hành vi:
  - Nút quay lại: chỉ hiện ở chế độ single-pane, ở màn chi tiết.
  - Trạng thái chọn (selected): chỉ hiện ở danh sách khi là two-pane.
  - Khi chuyển từ two-pane sang single-pane: màn chi tiết thường hiện, có app bar.
  - Không có mục nào được chọn: pane chi tiết hiện nội dung trống (empty state).
  - Lưu trạng thái khi chuyển giữa các chi tiết (đã đọc/chưa đọc); giữ vị trí cuộn.
- Medium: dùng single-pane cho nội dung mật độ cao hoặc cần tập trung; dùng two-pane để duyệt nhanh giữa các mục.

### 4.2 Supporting pane

Nguồn: https://m3.material.io/foundations/layout/canonical-examples/supporting-pane

- Dùng khi nội dung phụ chỉ có ý nghĩa với nội dung chính (soạn thảo tài liệu, bình luận, duyệt media). Nếu là quan hệ cha-con, dùng list-detail.
- Vùng chính chiếm khoảng 2/3; vùng phụ chiếm phần còn lại.
- Vị trí:
  - Compact và Medium: pane phụ nằm dưới pane chính (độ rộng flexible). Ở compact có thể dùng bottom sheet.
  - Expanded: pane phụ nằm bên leading hoặc trailing (độ rộng fixed 360dp).

### 4.3 Feed

Nguồn: https://m3.material.io/foundations/layout/canonical-examples/feed

- Dùng để duyệt nhanh nhiều nội dung dạng card hoặc list (tin tức, ảnh, mạng xã hội).
- Compact: các card xếp dọc, chiếm full chiều rộng.
- Medium: thêm cột, có thể mix card rộng và hẹp.
- Expanded trở lên: tăng số cột; độ rộng cột tăng ở breakpoint lớn hơn.
- Item tự reflow khi thay đổi không gian (xoay, gập/mở, multi-window).

### Áp dụng cho React Native

- Chọn canonical layout theo nhu cầu, rồi chọn số pane theo `getBreakpoint`.
- List-detail trên phone: ở compact dùng stack navigation (danh sách -> chi tiết). Ở expanded (phone ngang, tablet) hiển thị hai cột cạnh nhau bằng `flexDirection: 'row'`.
- Feed: `FlatList` với `numColumns` lấy từ breakpoint. Lưu ý khi đổi số cột, FlatList cần `key` mới để render lại (kiến thức RN).
- Tránh tự thiết kế layout phức tạp khi canonical đã phù hợp.

---

## 5. Adaptive design (tổng quan)

Nguồn: https://m3.material.io/foundations/layout/layout-overview/adaptive-design , https://m3.material.io/foundations/layout/layout-overview/overview

- Adaptive design là tập kỹ thuật thay đổi giao diện theo ngữ cảnh: tùy chọn người dùng, thiết bị, trạng thái, breakpoint. Khác với responsive design chỉ co giãn một layout, adaptive tùy biến cấu trúc, component và layout.
- Ba loại trải nghiệm: mobile, desktop, spatial. Bắt đầu từ mobile rồi mở rộng.
- Thiết kế phải hỗ trợ touch, pointer và bàn phím vật lý.
- Ba adaptive strategy: show and hide, levitate, reflow.
  - Co-planar: các pane đặt cạnh nhau.
  - Floating: pane nổi phía trên nội dung (như dialog).
  - Docked: pane nằm trên các pane khác, một cạnh kéo dài ra ngoài màn hình (như bottom sheet).
- Component thích ứng theo ba cách: resize (co giãn theo container), show và hide (thu gọn/mở rộng nội dung), presentation change (đổi hướng, màu, type, shape; ví dụ FAB mở rộng thành extended FAB).

### Áp dụng cho React Native

- Phone RN hiện là mobile; khi xoay ngang hoặc chạy trên tablet, cùng code phải đổi layout qua `useWindowDimensions`.
- Dùng strategy floating/docked bằng `Modal` hoặc sheet (không dùng UI library: tự dựng với `Animated` hoặc `Modal`).
- Nguồn: các trang trên.

---

## 6. Minimum touch target (48dp)

Nguồn: https://m3.material.io/foundations/layout/grids-spacing/density , https://m3.material.io/components/buttons/specs

- Target mặc định phải tối thiểu **48x48** (trang Density ghi "48x48 CSS pixels"; các phần khác ghi 48x48dp).
- Icon có thể nhỏ hơn, nhưng vùng tương tác vẫn phải 48x48dp. Ví dụ: icon button XS và S phải có target tối thiểu 48x48dp để đạt accessibility.
- Density: không giảm target xuống dưới 48x48dp mặc định. Component scaling (số -1, -2, -3) giảm padding hoặc chiều cao khoảng 4dp mỗi bậc, chỉ khi người dùng chọn và target còn đủ 48dp.
- Không tăng density trong màn hình tập trung (chọn từ menu) hoặc trong component cảnh báo (snackbar, dialog).

### Áp dụng cho React Native

- Dùng `hitSlop` của `Pressable` / `TouchableOpacity` để nới vùng chạm khi icon nhỏ, ví dụ:
  ```tsx
  <Pressable hitSlop={12} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
    {/* icon 24dp */}
  </Pressable>
  ```
- Đặt `minHeight: 48` và `minWidth: 48` cho mọi phần tử bấm được (kiến thức RN, không từ M3).
- Nguồn: https://m3.material.io/foundations/layout/grids-spacing/density

---

## Tóm tắt áp dụng nhanh

1. Phân loại breakpoint bằng `useWindowDimensions` theo ngưỡng 600/840/1200/1600dp.
2. Chỉ dùng spacing trong scale 8dp (kèm 2/4/6/10dp); padding và gap trên cha; tránh margin trên con.
3. Dùng safe area cho bar và vùng hệ thống; hỗ trợ RTL bằng `start`/`end`.
4. Chọn canonical layout (list-detail, supporting pane, feed) theo nội dung, rồi chọn số pane theo breakpoint.
5. Mọi phần tử bấm được có vùng chạm tối thiểu 48x48dp.
6. Chưa đọc được: số dp margin/gutter/cột theo breakpoint.
