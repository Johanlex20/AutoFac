/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily:{
        sans: ['"Google Sans Flex"', 'sans-serif'],
        google: ['"Google Sans Flex"', 'sans-serif'],
      },
      colors: {
        'blue-dark': '#001a4a',
        'blue-dark-medium': '#034579',
        'blue-main': '#008abb',
        'blue-light': '#95cadc',
        'blue-light-very': '#d4e7ed'
    },
    borderRadius:{
      'dashboard':'2rem', //  32px
    }
  },
  plugins: [],
  }
}
