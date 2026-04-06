import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050816',
          900: '#0a0e27',
          800: '#0f1538',
          700: '#141b4e',
          600: '#1e2666',
        },
        cyan: {
          400: '#67f7e0',
          500: '#00e5c7',
          600: '#00bfa6',
        },
        slate: {
          300: '#b8c5d6',
          400: '#8a9bb8',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'sonar': 'sonar 3s ease-out infinite',
        'sonar-delayed': 'sonar 3s ease-out 1s infinite',
        'sonar-delayed-2': 'sonar 3s ease-out 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'scan-line': 'scan-line 4s linear infinite',
      },
      keyframes: {
        sonar: {
          '0%': { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
