module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000', // Deep black
          dark: '#0b0b0f',  // Card background
          green: '#1DB954', // Spotify Green
          neon: '#21E065',  // Neon glow
          white: '#FFFFFF',
          gray: '#121212',
          light: {
            bg: '#F9FAFB',
            text: '#111827',
            heading: '#15803D'
          }
        }
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(33, 224, 101, 0.3)',
        'glow-strong': '0 0 30px rgba(33, 224, 101, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    }
  },
  plugins: [],
}
