import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050816",
          900: "#0a0e27",
          800: "#0f1538",
          700: "#141b4e",
          600: "#1e2666",
        },
        cyan: {
          400: "#67f7e0",
          500: "#00e5c7",
          600: "#00bfa6",
        },
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "#00e5c7",
        background: "#050816",
        foreground: "#e2e8f0",
        primary: {
          DEFAULT: "#00e5c7",
          foreground: "#050816",
        },
        secondary: {
          DEFAULT: "#0f1538",
          foreground: "#e2e8f0",
        },
        destructive: {
          DEFAULT: "#f43f5e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#0f1538",
          foreground: "#8a9bb8",
        },
        accent: {
          DEFAULT: "#0f1538",
          foreground: "#e2e8f0",
        },
        card: {
          DEFAULT: "#0a0e27",
          foreground: "#e2e8f0",
        },
        popover: {
          DEFAULT: "#0a0e27",
          foreground: "#e2e8f0",
        },
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindAnimate],
};
export default config;
