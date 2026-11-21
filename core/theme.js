import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { palette, fontFamilies, fontFamilyForWeight } from './palette';

export { palette, fontFamilies };

// Colors for things className can't reach (icon props, navigation/Paper themes, ActivityIndicator...).
export function getColors(isDark) {
  const mode = isDark ? palette.dark : palette.light;
  return { ...mode, brand: palette.brand, brandPressed: palette.brandPressed, danger: palette.danger, star: palette.star };
}

// Every Paper typescale variant gets the font file for its weight, and fontWeight is dropped so Android
// doesn't fake-bold on top of it.
function paperFonts(base) {
  return Object.fromEntries(
    Object.entries(base).map(([name, style]) => [
      name,
      { ...style, fontFamily: fontFamilyForWeight(style.fontWeight), fontWeight: '400' },
    ])
  );
}

export function createPaperTheme(isDark) {
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  const c = getColors(isDark);
  return {
    ...base,
    fonts: paperFonts(base.fonts),
    roundness: 3,
    colors: {
      ...base.colors,
      primary: c.brand,
      onPrimary: '#FFFFFF',
      primaryContainer: c.brandSoft,
      secondary: c.muted,
      background: c.background,
      surface: c.surface,
      surfaceVariant: c.surfaceAlt,
      onSurface: c.text,
      onSurfaceVariant: c.muted,
      onBackground: c.text,
      outline: c.outline,
      outlineVariant: c.border,
      error: c.danger,
      elevation: { level0: 'transparent', level1: c.surface, level2: c.surface, level3: c.surface, level4: c.surface, level5: c.surface },
    },
  };
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
