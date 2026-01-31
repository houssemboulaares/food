
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F2994A',
        secondary: '#F2C94C',
        background: '#FAF9F6',
        text: '#333333',
      }
    },
  },
  plugins: [],
}
