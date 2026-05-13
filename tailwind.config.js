/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#1570ef',
          600: '#175cd3',
          700: '#1849a9',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          dark: '#0f172a',
        },
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
};
