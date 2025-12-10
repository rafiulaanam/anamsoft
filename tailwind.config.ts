import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        blush: {
          50: "#fff7f9",
          100: "#ffeaf0",
          200: "#ffd1df",
          300: "#ffb3c8",
          400: "#ff80a4",
          500: "#f2558a",
          600: "#df326b",
          700: "#b92556",
          800: "#982549",
          900: "#7c2340"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
