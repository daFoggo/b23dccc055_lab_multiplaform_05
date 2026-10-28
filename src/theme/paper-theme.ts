// Theme Paper MD3 mac dinh cua React Native Paper, giu font Inter.
// Giu nguyen toan bo mau MD3 mac dinh, do bo goc mac dinh (roundness = 4), va elevation.
import {
  adaptNavigationTheme,
  configureFonts,
  MD3LightTheme,
} from 'react-native-paper';
import type {MD3Theme} from 'react-native-paper';
import {DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import type {Theme as NavigationTheme} from '@react-navigation/native';
import {fontFamily} from './fonts';
import {typography} from './metrics';

// Map tung bien the font MD3 sang font Inter (khong dung fontWeight de tuong thich Android).
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
  fonts: configureFonts({config: fontConfig}),
};

const {LightTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  materialLight: paperTheme,
});

export const navigationTheme: NavigationTheme = {
  ...NavigationDefaultTheme,
  ...LightTheme,
  fonts: {
    regular: {fontFamily: fontFamily.regular, fontWeight: 'normal'},
    medium: {fontFamily: fontFamily.semibold, fontWeight: 'normal'},
    bold: {fontFamily: fontFamily.bold, fontWeight: 'normal'},
    heavy: {fontFamily: fontFamily.bold, fontWeight: 'normal'},
  },
};
