/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#282828',
        yellow: '#FEDA00',
        'gray-light': '#F3F3F3',
        'gray-card': '#D9D9D9',
        'text-gray': '#5B5B5B',
        'text-dark': '#323131',
      },
      fontFamily: {
        sans: ['Exo\\ 2', 'sans-serif'],
      },
      borderRadius: {
        btn: '20px',
      },
    },
  },
  plugins: [],
}
