import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          500: "#2f6fdb",
          600: "#245cc0",
          700: "#1d4a9c"
        }
      }
    }
  },
  plugins: []
};
export default config;
