# Material Design 3: Typography, Shape, Elevation

Tài liệu tổng hợp từ các trang m3.material.io đã đọc được (lấy nội dung render qua trình duyệt). Các phần ghi "Áp dụng cho React Native StyleSheet" là gợi ý triển khai của tác giả tài liệu này, không phải nội dung từ nguồn M3.

Lưu ý đơn vị: trang token hiển thị font size, tracking và line height bằng "pt". Trang Font size units của M3 ghi đơn vị Android là sp, tỉ lệ 1.0 so với đơn vị web. Trong tài liệu này giá trị được giữ nguyên dạng số (đơn vị tương đương sp/dp trong React Native).

---

## 1. Typography

### 1.1 Tổng quan

- M3 type scale có 30 type style: 15 baseline và 15 emphasized. Cả hai bộ đều đi từ Display Large đến Label Small.
- Mỗi style có một token duy nhất gom đủ thuộc tính mặc định (font, size, line height, tracking, weight). Từng thuộc tính cũng có token riêng.
- Font mặc định là Roboto cho cả brand typeface (Display, Headline) lẫn plain typeface (Body, Label).
- Nguồn: https://m3.material.io/styles/typography/overview , https://m3.material.io/styles/typography/type-scale-tokens

### 1.2 Bảng type scale baseline (15 style)

Font: Roboto cho tất cả. Size, line height, tracking là giá trị token.

| Role | Style | Size (sp) | Line height | Weight | Tracking |
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

Nguồn: https://m3.material.io/styles/typography/type-scale-tokens (mục Baseline type style tokens, đọc từ token viewer)

### 1.3 Bảng emphasized type scale (15 style)

Emphasized dùng cùng size và tracking với baseline tương ứng ở bảng trên, khác ở weight và line height trong một số style.

| Role | Style | Size (sp) | Line height | Weight | Tracking |
|---|---|---|---|---|---|
| Display | Large | 57 | 64 | 500 | -0.25 |
| Display | Medium | 45 | 52 | 500 | 0 |
| Display | Small | 36 | 44 | 500 | 0 |
| Headline | Large | 32 | 40 | 500 | 0 |
| Headline | Medium | 28 | 36 | 500 | 0 |
| Headline | Small | 24 | 32 | 500 | 0 |
| Title | Large | 22 | 28 | 500 | 0 |
| Title | Medium | 16 | 24 | 700 | 0.15 |
| Title | Small | 14 | 20 | 700 | 0.1 |
| Body | Large | 16 | 24 | 500 | 0.5 |
| Body | Medium | 14 | 20 | 500 | 0.25 |
| Body | Small | 12 | 16 | 500 | 0.4 |
| Label | Large | 14 | 20 | 700 | 0.1 |
| Label | Medium | 12 | 16 | 700 | 0.5 |
| Label | Small | 11 | 16 | 700 | 0.5 |

Nguồn: https://m3.material.io/styles/typography/type-scale-tokens (mục Emphasized type style tokens)

### 1.4 Quy tắc sử dụng

- Chọn style theo vai trò: Display cho chữ/số lớn, ngắn, quan trọng (chủ yếu màn hình lớn). Headline cho nội dung ngắn, nhấn mạnh trên màn hình nhỏ. Title cho nội dung ngắn, mức nhấn vừa (tiêu đề phụ, app bar). Body cho đoạn văn dài. Label cho chữ trong component (nút) và chú thích nhỏ.
- Không dùng font trang trí/expressive cho Body và Label vì khó đọc ở size nhỏ.
- Emphasized không được dùng mặc định trong component. Để dùng, thay token baseline bằng token emphasized cùng style. Dùng cho: selected state, unread, nút primary, Extended FAB, selected list item, selected menu item, badge.
- Emphasized có thể kết hợp với weight đậm sẵn (nhấn mạnh hơn), hoặc dùng riêng cho vài điểm có ngữ cảnh (selected, unread).
- Không đổi size của token. Được phép đổi font, line height, letter spacing, weight để tinh chỉnh.
- Line height cho Title, Headline, Display: khoảng 1.2 lần size. Cho Body và Label: khoảng 1.5 lần size.
- Dùng tabular numbers (số có độ rộng cố định) trong bảng hoặc chỗ giá trị thay đổi liên tục (đồng hồ) để tránh nhảy layout.
- Độ tương phản: chữ lớn tối thiểu 3:1, chữ nhỏ tối thiểu 4.5:1. Màu chữ mặc định là on surface; on surface variant là lựa chọn thay thế tốt.
- Link trong văn bản: dùng primary (hoặc tertiary) và phải có gạch chân.
- Language height: Tiếng Việt thuộc nhóm "Medium (~7% taller)". Mặc định nên dùng medium cho line height và đổi theo ngôn ngữ phát hiện được. Component có chiều cao cố định có thể không tự thích ứng; không bỏ qua điều này nếu không sẽ bị chữ đè lên nhau.
- Nguồn: https://m3.material.io/styles/typography/applying-type , https://m3.material.io/styles/typography/type-scale-tokens (mục Language height support)

### 1.5 Font

- Mặc định: Roboto (Android và M3). Roboto Flex là variable font, chưa là một phần của M3 type scale.
- Chuỗi fallback khi dùng font variable: Roboto Flex -> Roboto -> Noto Sans.
- Nguồn: https://m3.material.io/styles/typography/fonts

### 1.6 Áp dụng cho React Native StyleSheet

```js
const typography = {
  bodyMedium: {
    fontSize: 14,        // size (sp)
    lineHeight: 20,      // line height
    letterSpacing: 0.25, // tracking: RN dùng đơn vị tuyệt đối, giống sp, không cần đổi sang em
    fontWeight: '400',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500',   // xem ghi chú bên dưới
  },
};
```

Ghi chú (kiến thức RN, không từ nguồn M3):
- `fontWeight` 500 và 700 trên Android chỉ đáng tin khi font có biến thể weight. Cách chắc chắn: nạp file Roboto/Roboto Flex qua `expo-font` hoặc `useFonts`, dùng `fontFamily` riêng cho từng weight (ví dụ `Roboto-Medium`).
- `letterSpacing` của RN nhận đơn vị tuyệt đối. Vì tracking M3 đã là sp tuyệt đối nên dùng trực tiếp giá trị token.
- Đặt `fontSize` và `lineHeight` theo bảng; không tự co giãn theo màn hình.

---

## 2. Shape

### 2.1 Tổng quan

- Shape M3 gồm: shape tuyệt đối (abstract), corner radius scale, và shape morph.
- Hình chữ nhật mặc định bo tròn đều ở cả bốn góc. Có thể chỉnh từng góc để tạo hình bất đối xứng.
- Các góc của component nằm sát nhau (menu, split button) dùng "inner corner" và bất đối xứng.
- Nguồn: https://m3.material.io/styles/shape/overview-principles , https://m3.material.io/styles/shape/corner-radius-scale

### 2.2 Corner radius scale (10 bậc)

| Token name (style) | Radius (dp) |
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
| Full | fully rounded (bo tròn hết, không có giá trị số cố định trên trang) |

Token corner value tương ứng: No corner value (0dp), Extra small (4dp), Small (8dp), Medium (12dp), Large (16dp), Large increased (20dp), Extra large (28dp), Extra large increased (32dp), Extra extra large (48dp).

Nguồn: https://m3.material.io/styles/shape/corner-radius-scale (mục Shape tokens và Corner radius scale)

Thay đổi từ M2 sang M3: M2 có 3 bậc theo kích thước container; M3 có 10 bậc theo độ bo góc. Ghi chú M3 Expressive (cập nhật May 2025): Large tăng lên 20dp, Extra large tăng lên 32dp, Extra extra large là 48dp; Full dùng token full thay cho 50% kích thước component trước đây.

### 2.3 Quy tắc

- Sản phẩm nên dùng nhất quán các style của M3. Tùy chỉnh được cho hero moment hoặc component riêng.
- Đổi giá trị của một style (ví dụ medium) sẽ áp dụng cho mọi component dùng style đó.
- Đổi style cho một component (ví dụ button mặc định là full) chỉ ảnh hưởng component đó.
- Không áp dụng góc lớn hoặc full cho component chứa nhiều thông tin, như card; góc lớn có thể cắt nội dung và ảnh.
- Khi lồng nhau hai vật bo tròn, không dùng cùng radius cho cả hai. Dùng optical roundness: radius trong = radius ngoài - padding (ví dụ 48dp - 14dp = 34dp).
- Shape morph nên phản hồi tương tác (nhấn, chọn). Ví dụ button nhấn có thể chuyển sang hình vuông hơn.
- Nguồn: https://m3.material.io/styles/shape/corner-radius-scale , https://m3.material.io/styles/shape/overview-principles

Ví dụ từ trang Buttons specs (ngoài danh sách yêu cầu, lấy từ cùng site): Round button là full ở mọi size. Square button: XS 12dp, S 12dp, M 16dp, L 28dp, XL 28dp. Pressed state: XS 8dp, S 8dp, M 12dp, L 16dp, XL 16dp. Nguồn: https://m3.material.io/components/buttons/specs

### 2.4 Áp dụng cho React Native StyleSheet

```js
export const shape = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  largeIncreased: 20,
  extraLarge: 28,
  extraLargeIncreased: 32,
  extraExtraLarge: 48,
  full: 9999, // RN không có % cho borderRadius; giá trị lớn đủ để bo hết (ghi chú RN)
};

const styles = StyleSheet.create({
  card: { borderRadius: shape.medium },
  button: { borderRadius: shape.full },
  // Góc bất đối xứng (inner corner của nhóm): dùng các thuộc tính riêng
  groupStart: {
    borderTopLeftRadius: shape.full,
    borderBottomLeftRadius: shape.full,
    borderTopRightRadius: shape.small,
    borderBottomRightRadius: shape.small,
  },
});
```

Lưu ý: giá trị `full` của M3 là "bo hết", trong RN dùng 9999 hoặc `height / 2`, cần đảm bảo `height` cố định.

---

## 3. Elevation

### 3.1 Tổng quan

- Elevation là khoảng cách giữa hai surface trên trục z, đơn vị dp.
- Token không có shadow hay màu riêng. Mỗi nền tảng tự quyết định shadow và giá trị cụ thể cho từng level.
- Có thể thể hiện elevation bằng tonal surface color hoặc shadow.
- Không nên đổi elevation mặc định của component M3. Dùng ít level để tối ưu thông điệp thị giác.
- Khác M2: không dùng shadow cho mọi level; dùng shadow khi cần tách khỏi nền hoặc khuyến khích tương tác. Elevation được mô tả theo level.
- Nguồn: https://m3.material.io/styles/elevation/overview

### 3.2 Các level elevation

| Level | Elevation (dp) | Vai trò |
|---|---|---|
| 0 | 0 | Resting. Nhiều component mặc định: App bar (không cuộn), button filled/tonal/outlined, card filled/outlined, chip, list, navigation rail, tabs, slider |
| +1 | 1 | Resting. Banner, bottom sheet (modal), elevated button, elevated card, elevated chip, navigation drawer (modal), side sheet (modal) |
| +2 | 3 | Resting. App bar (đã cuộn), menu, navigation bar, rich tooltip, toolbar |
| +3 | 6 | Resting. Date picker, dialog (modal), extended FAB, FAB, FAB menu (nút đóng), search, time picker |
| +4 | 8 | Dành cho trạng thái tương tác (hover, dragged). Không gán làm resting |
| +5 | 12 | Dành cho trạng thái tương tác. Không gán làm resting |

Ghi chú: trang token không gán level +4 và +5 làm resting. Level 0 đến +3 là resting; +4 và +5 dành cho hover và dragged.

Nguồn: https://m3.material.io/styles/elevation/applying-elevation (mục levels), https://m3.material.io/styles/elevation/tokens (bảng Component elevation)

### 3.3 Quy tắc tonal elevation và tương tác

- Tonal elevation: surface tint color đã deprecated. Dùng các token elevation level 0 đến 5 thay thế.
- Mặc định, surface M3 tách nhau bằng tonal difference (khác màu nền). Có thể thêm drop shadow hoặc scrim khi cần.
- Các surface chồng lên nhau phải có color role khác nhau để thể hiện tách biệt. Color role không gắn với elevation; chọn từ dải surface và surface container.
- Component nên tăng elevation khi tương tác, thường là +1 level so với resting. Ví dụ FAB khi hover đi từ level 3 lên level 4. Mọi button M3 tăng 1 level khi hover. Thay đổi này phải nhất quán giữa các component tương tự.
- Nút disabled của elevated button có elevation 0.
- Shadow nên ít dùng. Chỉ dùng khi cần bảo vệ phần tử trên nền có họa tiết, hoặc để nhấn mạnh khả năng tương tác.
- Scrim: dùng color role scrim với opacity 32% dưới modal và navigation menu mở rộng.
- Nguồn: https://m3.material.io/styles/elevation/applying-elevation , https://m3.material.io/styles/elevation/tokens , https://m3.material.io/components/buttons/specs (state elevation của elevated button)

### 3.4 Áp dụng cho React Native StyleSheet

Gợi ý triển khai (không phải giá trị từ M3): trang M3 không cung cấp shadow cụ thể, chỉ có level dp. Dưới đây là cách biểu diễn trong RN.

```js
// Level dp theo M3
export const elevation = { 0: 0, 1: 1, 2: 3, 3: 6, 4: 8, 5: 12 };

// Android: prop elevation nhận dp trực tiếp
// iOS: dùng shadow* props; giá trị shadow là gợi ý, cần tinh chỉnh
const shadowFor = (level) => {
  if (level === 0) return {};
  const dp = elevation[level];
  return {
    elevation: dp,                       // Android
    shadowColor: '#000',                 // iOS
    shadowOffset: { width: 0, height: dp / 2 },
    shadowOpacity: 0.15,
    shadowRadius: dp,
  };
};

// Tonal elevation: thay vì shadow, đổi backgroundColor theo color role surface/surface container
// (giá trị màu lấy từ theme của app, không cố định trong nguồn này).
```

Lưu ý RN:
- Trên Android, `elevation` cũng vẽ shadow và có thể làm nền đục nếu `backgroundColor` trong suốt; đặt nền rõ ràng cho component có elevation.
- Không đặt elevation cho View có `overflow: 'hidden'` nếu cần shadow hiển thị (ghi chú RN, cần kiểm tra thực tế).

---

## Danh sách nguồn đã đọc

- https://m3.material.io/styles/typography/overview (đã đọc)
- https://m3.material.io/styles/typography/type-scale-tokens (đã đọc, gồm token viewer baseline và emphasized)
- https://m3.material.io/styles/typography/applying-type (đã đọc)
- https://m3.material.io/styles/typography/fonts (đã đọc)
- https://m3.material.io/styles/shape/overview-principles (đã đọc)
- https://m3.material.io/styles/shape/corner-radius-scale (đã đọc)
- https://m3.material.io/styles/elevation/overview (đã đọc)
- https://m3.material.io/styles/elevation/applying-elevation (đã đọc)
- https://m3.material.io/styles/elevation/tokens (đã đọc)
- https://m3.material.io/components/buttons/specs (đã đọc, dùng làm ví dụ bổ sung)

Không đọc được: không có mục nào trong danh sách yêu cầu bị thiếu. Số liệu shadow cụ thể cho từng level không có trong nguồn (trang nói token không có shadow), nên phần shadow ở mục 3.4 là gợi ý của tác giả.
