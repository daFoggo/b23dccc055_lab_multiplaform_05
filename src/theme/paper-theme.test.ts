import {navigationTheme, paperTheme} from './paper-theme';

test('paperTheme matches default MD3 colors, roundness and Inter fonts', () => {
  expect(paperTheme.colors.primary).toBe('rgba(103, 80, 164, 1)');
  expect(paperTheme.colors.background).toBe('rgba(255, 251, 254, 1)');
  expect(paperTheme.roundness).toBe(4);
  expect(paperTheme.fonts.bodyLarge.fontFamily).toBe('Inter_18pt-Regular');
  expect(paperTheme.fonts.labelLarge.fontFamily).toBe('Inter_18pt-SemiBold');
});

test('navigationTheme background matches the Paper background', () => {
  expect(navigationTheme.colors.background).toBe(paperTheme.colors.background);
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
