/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
          950: '#1e3a5f',
        },
        violet: {
          400: '#b197fc',
          500: '#9775fa',
          600: '#845ef7',
        },
        surface: {
          0: '#ffffff',
          50: '#f8f9fc',
          100: '#f1f3f9',
          200: '#e4e8f1',
          300: '#d1d6e3',
          800: '#2d3142',
          900: '#1e2030',
          950: '#13141f',
        },
        night: {
          100: '#e4e4eb',
          400: '#7a7a90',
          600: '#252532',
          700: '#1c1c24',
          800: '#141419',
          900: '#0c0c10',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)',
        'glow': '0 0 20px rgba(92,124,250,0.15)',
      }
    },
  },
  plugins: [],
}
