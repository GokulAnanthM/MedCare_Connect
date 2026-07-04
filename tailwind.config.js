/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
      },
      boxShadow: {
        'brand-glow': '0 20px 45px -20px rgba(79, 70, 229, 0.55)',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
        'app-mesh':
          'radial-gradient(at 12% 8%, rgba(14,165,233,0.25) 0px, transparent 45%), radial-gradient(at 80% 20%, rgba(168,85,247,0.22) 0px, transparent 40%), radial-gradient(at 30% 90%, rgba(99,102,241,0.20) 0px, transparent 45%)',
      },
    },
  },
  plugins: [],
};
