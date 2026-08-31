/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
    serif: ['"Playfair Display"', "serif"],
     },
      colors: {
        // Professional E-commerce Palette
        primary: {
          DEFAULT: '#ef4c7f', // Brand Pink
          dark: '#d93f66',    // Darker Pink
          light: '#fcecf1',   // Light Pink
        },
        secondary: {
          DEFAULT: '#c1865a', // Warm Gold/Orange
          light: '#e8cbb5',   // Light Gold
        },
        dark: {
          DEFAULT: '#1c1917', // Warm Dark (Stone 900)
          light: '#292524',   // Warm Dark Light (Stone 800)
        },
        success: '#059669',   // Emerald 600
        'bg-body': '#f9fafb', // Gray 50
        muted: '#6b7280',      // Gray 500
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },

  plugins: [],
}
