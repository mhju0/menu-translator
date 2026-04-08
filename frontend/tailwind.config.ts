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
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        apple: {
          bg: "#fbfbfd",
          surface: "#ffffff",
          ink: "#1d1d1f",
          muted: "#86868b",
          link: "#0066cc",
          accent: "#0071e3",
          "accent-hover": "#0077ed",
        },
      },
      maxWidth: {
        content: "980px",
      },
      screens: {
        nav: "834px",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
