// Single source of truth for colors and font families.
// CommonJS on purpose: tailwind.config.js (Node) and the app (Metro) both import it.

const brand = {
  DEFAULT: '#00B8C0',
  pressed: '#009AA1',
};

const palette = {
  brand: brand.DEFAULT,
  brandPressed: brand.pressed,
  danger: '#F13A59',
  star: '#F59E0B',
  light: {
    background: '#F4F6F7',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF1F3',
    text: '#10181B',
    muted: '#66737B',
    border: '#E3E8EB',
    outline: '#C4CCD1',
    brandSoft: '#E3F7F8',
    link: '#007F85',
  },
  dark: {
    background: '#0D1114',
    surface: '#171C20',
    surfaceAlt: '#222A2F',
    text: '#EEF2F4',
    muted: '#98A4AC',
    border: '#2A3238',
    outline: '#46515A',
    brandSoft: '#0C3A3D',
    link: '#3DD6DE',
  },
};

// One family per weight: Android does not map fontWeight onto custom font files (it would fake-bold
// the regular file), so every weight is its own family and fontWeight is never set.
const fontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

function fontFamilyForWeight(weight) {
  switch (String(weight)) {
    case '500':
      return fontFamilies.medium;
    case '600':
      return fontFamilies.semibold;
    case '700':
    case 'bold':
      return fontFamilies.bold;
    case '800':
    case '900':
      return fontFamilies.extrabold;
    default:
      return fontFamilies.regular;
  }
}

module.exports = { brand, palette, fontFamilies, fontFamilyForWeight };
