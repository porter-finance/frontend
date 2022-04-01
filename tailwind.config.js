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
      xl: [
        '22px',
        {
          letterSpacing: '0.01em',
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
    themes: [
      {
        dark: {
          ...require('daisyui/src/colors/themes')['[data-theme=dark]'],
          'base-100': '#131415',
          'bg-neutral': '#181A1C',
        },
      },
      'light',
    ],
  },
  darkMode: 'class',
}
