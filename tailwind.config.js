/** @type {import('tailwind.config').Config} */
export default {
  // [关键] 开启类名控制模式
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}