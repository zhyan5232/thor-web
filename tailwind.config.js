/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 复刻 Vben 的主蓝色
        primary: '#0960bd',
      },
    },
  },
  plugins: [],
}