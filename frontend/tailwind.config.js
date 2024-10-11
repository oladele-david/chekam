/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customCyan: '#1fd5d2',
        customBlue: '#008ee4',
      }
    },
  },
  plugins: [],
}

