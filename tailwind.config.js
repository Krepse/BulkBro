/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        indigo: {
          600: '#4F46E5',
        },
        slate: {
          50: '#F8FAFC',
          900: '#0F172A',
          400: '#94A3B8',
        },
        green: {
          500: '#22C55E',
        },
      },
      borderRadius: {
        '2rem': '2rem',
        '2.5rem': '2.5rem',
        '3rem': '3rem',
      }
    },
  },
  plugins: [],
}
