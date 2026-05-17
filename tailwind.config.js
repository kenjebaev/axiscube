/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cube: {
          white: '#f8fafc',
          yellow: '#facc15',
          red: '#ef4444',
          orange: '#f97316',
          blue: '#3b82f6',
          green: '#22c55e',
          inner: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
