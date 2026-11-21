/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.js',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './core/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      scale: {
        200: '2.5',
      },
    },
  },
  plugins: [],
};
