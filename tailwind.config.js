// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    "aspect-[16/9]",
    "aspect-[4/5]",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '2000px',
      },
      fontFamily: {
        sans: ['Replica', 'sans-serif'],
      },
      keyframes: {
        pendulum: {
          '0%':   { transform: 'rotateY(-30deg)' },
          '50%':  { transform: 'rotateY(30deg)' },
          '100%': { transform: 'rotateY(-30deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        scrollRight: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(var(--scroll-distance, 100%))' },
        },
      },
      animation: {
        pendulum:   'pendulum var(--speed, 8s) ease-in-out infinite',
        float:      'float 2s ease-in-out infinite',
        scrollRight: 'scrollRight 15s linear infinite alternate',
      },
    },
  },
  plugins: [],
};
