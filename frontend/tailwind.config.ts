import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        kakao: {
          yellow: "#FEE500",
          "yellow-hover": "#F5DC00",
          brown: "#391B1B",
          ink: "#191919",
          muted: "#666666",
          bg: "#F6F6F6",
          surface: "#FFFFFF",
          border: "#E5E5E5",
          "border-hover": "#CCCCCC",
          chat: "#B2E1FF",
          accent: "#3C1E1E",
        },
      },
      maxWidth: {
        content: "960px",
      },
      screens: {
        nav: "768px",
      },
      borderRadius: {
        kakao: "16px",
        "kakao-sm": "12px",
        "kakao-lg": "20px",
      },
      transitionTimingFunction: {
        kakao: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
