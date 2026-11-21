const { brand, palette, fontFamilies } = require('./core/palette');

// { DEFAULT: <light>, dark: <dark> } so classes read `bg-surface dark:bg-surface-dark`.
const pair = (key) => ({ DEFAULT: palette.light[key], dark: palette.dark[key] });

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.js',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './core/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  // fontWeight is replaced by the font-* families below: font-bold selects the Bold font file instead
  // of setting fontWeight, which Android would render as faux-bold on top of the regular file.
  corePlugins: { fontWeight: false },
  theme: {
    fontFamily: {
      medium: [fontFamilies.medium],
      semibold: [fontFamilies.semibold],
      bold: [fontFamilies.bold],
      extrabold: [fontFamilies.extrabold],
    },
    extend: {
      colors: {
        brand: { DEFAULT: brand.DEFAULT, pressed: brand.pressed, soft: palette.light.brandSoft, 'soft-dark': palette.dark.brandSoft },
        background: pair('background'),
        surface: pair('surface'),
        'surface-alt': pair('surfaceAlt'),
        text: pair('text'),
        muted: pair('muted'),
        border: pair('border'),
        link: pair('link'),
        danger: palette.danger,
        star: palette.star,
      },
    },
  },
  plugins: [],
};
