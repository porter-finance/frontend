const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './public/index.html'],
  theme: {
    fontSize: {
      sm: [
        '14px',
        {
          letterSpacing: '0.1em',
        },
      ],
      base: [
        '16px',
        {
          letterSpacing: '0.05em',
        },
      ],
      '3xl': [
        '32px',
        {
          letterSpacing: '0.05em',
        },
      ],
    },
    extend: {
      fontFamily: {
        sans: ['Neue Haas Grotesk Display Pro', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
  darkMode: 'class',
}
