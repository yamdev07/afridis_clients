/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        accent: {
          green: '#10B981',
          purple: '#8B5CF6',
          orange: '#F59E0B',
        }
      },
      borderRadius: {
        '18': '18px',
      }
    },
  },
  plugins: [],
}
