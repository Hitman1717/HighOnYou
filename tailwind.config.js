/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        strava: {
          DEFAULT: '#FC4C02',
          hover: '#E03F00',
          dark: '#B83200',
          light: '#FFF0EA',
          bg: '#1f130e'
        },
        gym: {
          primary: '#10B981',
          dark: '#059669',
          accent: '#6366F1'
        }
      }
    },
  },
  plugins: [],
}

