import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        paper: "#FFF9EF",
        mint: "#B8F2D0",
        coral: "#FF7A6B",
        lemon: "#FFE66D",
        teal: "#2EC4B6",
        grape: "#6B5DD3",
      },
      boxShadow: {
        soft: "0 14px 35px rgba(32, 33, 36, 0.12)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        transfer: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateX(300%)", opacity: "0" },
        },
        pop: {
          "0%": { transform: "scale(0.8) translateY(10px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        transfer: "transfer 1.5s linear infinite",
        pop: "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
