/** @type {import('tailwind.config').Config} */
export default {
  // 必须加上这一行！告诉 Tailwind 通过类名控制暗黑模式
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