import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          primary: "#1a1a2e",
          secondary: "#16213e",
          tertiary: "#0f3460",
          surface: "#1e1e2e",
        },
        mint: {
          primary: "#f8fafc",
          secondary: "#ffffff",
          tertiary: "#f1f5f9",
          surface: "#ecfdf5",
        },
        slate: {
          primary: "#fafafa",
          secondary: "#ffffff",
          tertiary: "#f5f5f5",
          surface: "#f8fafc",
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 1s ease-in-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
