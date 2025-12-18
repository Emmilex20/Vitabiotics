// /client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all files in src
  ],
  theme: {
    extend: {
      colors: {
        'vita-primary': '#005f56', // A nice Viridian green/teal for Vitabiotics
        'vita-secondary': '#ffc000', // Accent color
        'vita-text': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}