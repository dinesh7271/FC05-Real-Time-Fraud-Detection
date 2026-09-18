/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#6344d4',
          700: '#522ba7',
          800: '#3d1b82',
          900: '#260f58',
          950: '#140633',
        },
        dark: {
          850: '#181b2a',
          900: '#111422',
          950: '#0a0d18',
        },
      },
      boxShadow: {
        'elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 25px rgba(139, 92, 246, 0.15)',
        'glow-purple': '0 0 30px -5px rgba(124, 58, 237, 0.35)',
      },
    },
  },
  plugins: [],
}
