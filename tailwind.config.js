/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        tour: {
          bg: '#06101A',
          'bg-secondary': '#0B1724',
          gold: '#D9A94E',
          'gold-light': '#F2D08A',
          text: '#F7F3EA',
          muted: '#AEB8C5',
          cyan: '#62B6FF',
          success: '#38D996',
          border: 'rgba(255,255,255,0.08)',
        },
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
        premium: '28px',
        pill: '999px',
      },
      boxShadow: {
        glass: '0 12px 24px rgba(0,0,0,0.24)',
      },
    },
  },
  plugins: [],
};
