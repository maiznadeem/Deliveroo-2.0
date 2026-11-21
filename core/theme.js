import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { palette, fontFamilies } from './palette';

export { palette, fontFamilies };

// Colors for things className can't reach (icon props, navigation/Paper themes, ActivityIndicator...).
export function getColors(isDark) {
  const mode = isDark ? palette.dark : palette.light;
  return { ...mode, brand: palette.brand, brandPressed: palette.brandPressed, danger: palette.danger, star: palette.star };
}

// React Navigation 7 theme fonts need fontWeight; the family already carries the weight.
const navFont = (fontFamily) => ({ fontFamily, fontWeight: '400' });

export function createNavigationTheme(isDark) {
  const base = isDark ? NavigationDarkTheme : NavigationLightTheme;
  const c = getColors(isDark);
  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: c.brand,
      background: c.background,
      card: c.surface,
      text: c.text,
      border: c.border,
      notification: c.brand,
    },
    fonts: {
      regular: navFont(fontFamilies.regular),
      medium: navFont(fontFamilies.medium),
      bold: navFont(fontFamilies.bold),
      heavy: navFont(fontFamilies.extrabold),
    },
  };
}

// Light mode: elevation. Dark mode: surfaces get a border instead (see the `dark:border` classes).
export const cardShadow = {
  shadowColor: '#0B1F24',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};
