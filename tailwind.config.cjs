/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', 'sans-serif'],
        'body': ['Open Sans', 'system-ui', 'sans-serif'],
        'heading': ['Montserrat', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.0125em' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.0125em' }],
        'xl': ['1.25rem', { lineHeight: '1.6', letterSpacing: '0.0125em' }],
        '2xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '0.0125em' }],
        '3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '0.0125em' }],
        '4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '0.0125em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '0.0125em' }]
      }
    }
  },
  plugins: []
};