# Phong cách giao diện: Paper (M3) kết hợp "phẳng" kiểu wattprint

Lõi UI là React Native Paper. Mọi tinh chỉnh phẳng chỉ nằm ở hai nơi: `src/theme/paper-theme.ts` (theme) và `src/theme/component-styles.ts` (StyleSheet/hằng số). Màu, font, bo góc lấy từ `colors.ts`, `fonts.ts`, `metrics.ts`. Tham chiếu M3: [material-3.md](material-3.md).

## Bảng map token sang Paper

| Nguyên tắc (wattprint / M3) | Token | Nơi áp dụng |
| --- | --- | --- |
| Nền trang xám nhạt `#F4F4F4` | `surface` | `paperTheme.colors.background` / `surface`; `navigationTheme.colors.background` |
| Thẻ trắng, bo 24, không viền, không bóng | `surfaceContainerLow`, `radius.card` | `flatStyles.card` (prop `style` của `Card`/`Surface`) |
| Điều khiển bo 16 | `radius.control` | `paperTheme.roundness = 16`; `flatStyles.buttonShape` |
| Chip, search, badge dạng pill | `radius.full` | `flatStyles.pill` |
| Ô nhập nền xám đặc, không viền lúc nghỉ, viền 2px khi focus/lỗi | `surfaceContainerHigh` (= `surfaceVariant`) | `flatStyles.input`, `flatStyles.inputOutline`, `flatInputProps` |
| Phần tử bấm tối thiểu 48dp | `touchTarget` | `flatStyles.buttonContent` (`contentStyle` của `Button`) |
| Chỉ Inter Regular / SemiBold / Bold, dùng `fontFamily` riêng | `fontFamily`, `typography` | `paperTheme.fonts` (`configureFonts`) |
| Vai trò màu M3, seed `#6750A4` | `colors.*` | `paperTheme.colors` |
| Header không bóng | n/a | `headerShadowVisible: false` ở screenOptions |
| Chat: online, bong bóng | `online`, `bubbleMine/Other`, `onBubbleMine/Other` | dùng trực tiếp từ `colors` |

## Quy tắc

- Không tạo component tự dựng để bọc Paper. Dùng thẳng component Paper và truyền `flatStyles.*` hoặc `{...flatInputProps}`.
- Chỉ tạo component riêng khi một chỉnh sửa không đạt được bằng theme hoặc style hằng số; phải ghi lý do vào mục "Ngoại lệ" bên dưới.
- `component-styles.ts` chỉ chứa StyleSheet/hằng số, không có React component.
- Không dùng `fontWeight`; chọn độ đậm bằng `fontFamily` (Android chọn đậm theo tên file).
- Không đổ bóng, không viền thẻ. `Card` Paper mặc định là `elevated`: dùng `mode="contained"` (hoặc `Surface elevation={0}`) để có kiểu phẳng.

## Ngoại lệ

Chưa có.

## Font

- Inter 18pt (Regular, SemiBold, Bold) nằm trong `android/app/src/main/assets/fonts/`, nguồn OFL.
- Chưa làm cho iOS: cần thêm file font vào Xcode project và `UIAppFonts` trong `Info.plist`.
- Không có Inter Medium (500): nhãn/tiêu đề M3 vốn 500 nay dùng SemiBold.

## Chưa áp dụng

Dark mode, tab bar nổi, danh sách gom nhóm trong thẻ có đường kẻ.

## Icon (MaterialCommunityIcons)

- Toàn app dùng MaterialCommunityIcons (mặc định của Paper); tên icon tập trung ở `src/theme/icons.ts`, test `src/lib/icons.test.ts` kiểm tra tên tồn tại trong glyphmap.
- Android: `iconFontNames` trong `android/app/build.gradle` = `MaterialCommunityIcons.ttf`.
- iOS: đã thêm `MaterialCommunityIcons.ttf` vào `UIAppFonts` (Info.plist); chưa kiểm chứng bước copy font (build phase / Pods setup) trên iOS.
