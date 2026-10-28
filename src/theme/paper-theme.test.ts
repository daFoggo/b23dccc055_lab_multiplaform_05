import {navigationTheme, paperTheme} from './paper-theme';
import {flatStyles} from './component-styles';

test('paperTheme maps tokens to MD3 colours, roundness and Inter fonts', () => {
  expect(paperTheme.colors.primary).toBe('#6750A4');
  expect(paperTheme.colors.background).toBe('#F4F4F4');
  expect(paperTheme.roundness).toBe(16);
  expect(paperTheme.fonts.bodyLarge.fontFamily).toBe('Inter_18pt-Regular');
  expect(paperTheme.fonts.labelLarge.fontFamily).toBe('Inter_18pt-SemiBold');
});

test('navigationTheme background matches the Paper background', () => {
  expect(navigationTheme.colors.background).toBe('#F4F4F4');
});

test('flatStyles exposes the flat constants', () => {
  expect(flatStyles.card.borderRadius).toBe(24);
  expect(flatStyles.pill.borderRadius).toBe(999);
  expect(flatStyles.buttonContent.height).toBe(48);
  expect(flatStyles.buttonShape.borderRadius).toBe(16);
  expect(flatStyles.input.borderRadius).toBe(16);
  expect(flatStyles.inputOutline.borderWidth).toBe(2);
});

test('navigationTheme fonts use Inter for every weight', () => {
  expect(navigationTheme.fonts.regular.fontFamily).toBe('Inter_18pt-Regular');
  expect(navigationTheme.fonts.bold.fontFamily).toBe('Inter_18pt-Bold');
  for (const font of Object.values(navigationTheme.fonts)) {
    expect(font.fontFamily).toMatch(/^Inter_18pt-/);
    expect(font.fontWeight).toBe('normal');
  }
});

test('every paperTheme font is Inter', () => {
  for (const font of Object.values(paperTheme.fonts)) {
    expect(font.fontFamily).toMatch(/^Inter_18pt-/);
  }
});
