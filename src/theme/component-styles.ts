// Chi chua StyleSheet/hang so dung lai, khong co component. Man hinh truyen vao prop `style`,
// `contentStyle`, `outlineStyle`, `underlineStyle` cua Paper.
import {StyleSheet} from 'react-native';
import {colors} from './colors';
import {radius, touchTarget} from './metrics';

export const flatStyles = StyleSheet.create({
  // O nhap phang: nen xam dac, bo 16, cao 52. Dung voi mode="outlined" + outlineStyle={flatStyles.inputOutline}.
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.control,
    minHeight: 52,
  },
  // Vien trong suot 2px luc nghi; focus/loi do Paper to mau (outlineColor/activeOutlineColor).
  inputOutline: {
    borderRadius: radius.control,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  // Noi dung nut cao 48dp (prop contentStyle).
  buttonContent: {height: touchTarget},
  // Goc nut bo 16 (prop style).
  buttonShape: {borderRadius: radius.control},
  // The trang bo 24, khong vien, khong bong.
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.card,
    elevation: 0,
    shadowOpacity: 0,
  },
  // Chip/search/badge dang pill.
  pill: {borderRadius: radius.full},
});

// Props Paper khong dat duoc bang theme: spread vao <TextInput {...flatInputProps} />.
export const flatInputProps = {
  mode: 'outlined' as const,
  outlineColor: 'transparent',
  activeOutlineColor: colors.primary,
  outlineStyle: flatStyles.inputOutline,
  style: flatStyles.input,
};
