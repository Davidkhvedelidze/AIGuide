/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF6FF',
          100: '#D9EBFF',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        ink: '#0F172A',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
