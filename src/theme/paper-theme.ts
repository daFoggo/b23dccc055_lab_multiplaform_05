// Theme Paper dung tu token: MD3LightTheme + mau/font/bo goc cua design system phang.
// Moi tinh chinh giao dien nam o day hoac trong component-styles.ts, khong tao component tu dung.
import {adaptNavigationTheme, configureFonts, MD3LightTheme} from 'react-native-paper';
import type {MD3Theme} from 'react-native-paper';
import {DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import type {Theme as NavigationTheme} from '@react-navigation/native';
import {colors} from './colors';
import {fontFamily} from './fonts';
import {radius, typography} from './metrics';

// Bien the khong co trong typography (display, headline lon...) dung Inter Regular, khong fontWeight.
const variants = Object.keys(MD3LightTheme.fonts) as (keyof typeof MD3LightTheme.fonts)[];
const fontConfig = Object.fromEntries(
  variants.map(variant => {
    const style = typography[variant];
    return [
      variant,
      {
        ...MD3LightTheme.fonts[variant],
        fontWeight: 'normal' as const,
        ...(style ?? {fontFamily: fontFamily.regular}),
      },
    ];
  }),
);

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radius.control,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primaryContainer,
    onPrimaryContainer: colors.onPrimaryContainer,
    secondary: colors.secondary,
    onSecondary: colors.onSecondary,
    secondaryContainer: colors.secondaryContainer,
    onSecondaryContainer: colors.onSecondaryContainer,
    tertiary: colors.tertiary,
    error: colors.error,
    onError: colors.onError,
    errorContainer: colors.errorContainer,
    onErrorContainer: colors.onErrorContainer,
    background: colors.surface,
    onBackground: colors.onSurface,
    surface: colors.surface,
    onSurface: colors.onSurface,
    surfaceVariant: colors.surfaceContainerHigh,
    onSurfaceVariant: colors.onSurfaceVariant,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
    inverseSurface: colors.inverseSurface,
    inverseOnSurface: colors.inverseOnSurface,
    scrim: colors.scrim,
    shadow: colors.scrim,
    elevation: {
      level0: 'transparent',
      level1: colors.surfaceContainerLow,
      level2: colors.surfaceContainer,
      level3: colors.surfaceContainer,
      level4: colors.surfaceContainerHigh,
      level5: colors.surfaceContainerHigh,
    },
  },
};

const {LightTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  materialLight: paperTheme,
});

export const navigationTheme: NavigationTheme = {
  ...NavigationDefaultTheme,
  ...LightTheme,
  // adaptNavigationTheme khong tao fonts cho nav v7 nen dung Inter tu token.
  fonts: {
    regular: {fontFamily: fontFamily.regular, fontWeight: 'normal'},
    medium: {fontFamily: fontFamily.semibold, fontWeight: 'normal'},
    bold: {fontFamily: fontFamily.bold, fontWeight: 'normal'},
    heavy: {fontFamily: fontFamily.bold, fontWeight: 'normal'},
  },
};
