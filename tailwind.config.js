/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#b3e0ff',
          200: '#80caff',
          300: '#4db3ff',
          400: '#1a9dff',
          500: '#0087e6',
          600: '#006bb3',
          700: '#004f80',
          800: '#00334d',
          900: '#00171a',
        },
        secondary: {
          50: '#e6fff9',
          100: '#b3ffef',
          200: '#80ffe6',
          300: '#4dffdc',
          400: '#1affd2',
          500: '#00e6b8',
          600: '#00b38f',
          700: '#008066',
          800: '#004d3d',
          900: '#001a14',
        },
        accent: {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffe080',
          300: '#ffd34d',
          400: '#ffc61a',
          500: '#e6ac00',
          600: '#b38600',
          700: '#805f00',
          800: '#4d3900',
          900: '#1a1300',
        },
        dark: {
          50: '#e6e8ec',
          100: '#b3bbc3',
          200: '#808e9a',
          300: '#4d6272',
          400: '#1a3549',
          500: '#0A1A2F',
          600: '#081729',
          700: '#05101c',
          800: '#030a10',
          900: '#010305',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 90deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary.400), 0 0 20px theme(colors.primary.500/50)',
        'neon-lg': '0 0 10px theme(colors.primary.400), 0 0 30px theme(colors.primary.500/50), 0 0 50px theme(colors.primary.600/30)',
        'neon-secondary': '0 0 5px theme(colors.secondary.400), 0 0 20px theme(colors.secondary.500/50)',
      }
    },
  },
  plugins: [],
};