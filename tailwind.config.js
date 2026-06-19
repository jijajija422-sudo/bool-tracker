/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f2',
          100: '#eceee2',
          200: '#d7dbca',
          300: '#b8c0a3',
          400: '#94a178',
          500: '#758458',
          600: '#5b6943',
          700: '#475235',
          800: '#3a422d',
          900: '#323a28',
          950: '#1a1f15',
          DEFAULT: '#B2AC88', // User's requested Sage Green
        },
        'off-white': '#F9F9F9',
        'warm-cream': '#F5F5DC',
      },
    },
  },
  plugins: [],
}
