import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WhenCab palette — highway-at-night: near-black ground, ember/flare glow
        ink: {
          DEFAULT: "#0B0908",
          soft: "#141110",
          surface: "#1B1614",
          border: "#2C2420",
        },
        ember: {
          DEFAULT: "#D62828",
          bright: "#F13A3A",
          dim: "#8A1C1C",
        },
        flare: {
          DEFAULT: "#F77F00",
          bright: "#FF9A2E",
          dim: "#B85E00",
        },
        amber: {
          DEFAULT: "#FCA311",
        },
        cream: "#FBEBDD",
        smoke: "#B8A99C",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "road-glow":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(247,127,0,0.35) 0%, rgba(214,40,40,0.18) 35%, rgba(11,9,8,0) 70%)",
        "road-lines":
          "repeating-linear-gradient(115deg, rgba(251,235,221,0.035) 0px, rgba(251,235,221,0.035) 2px, transparent 2px, transparent 90px)",
      },
    },
  },
  plugins: [],
};
export default config;
