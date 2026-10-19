import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Shared FEMXO brand scale: purple with a lavender tint.
        brand: {
          50: "#F6F0FC",
          100: "#EBDDF7",
          200: "#D8BDEA",
          300: "#C49BDD",
          400: "#A975CB",
          500: "#8A52B6",
          600: "#6C35A5",
          700: "#5A2B8A",
          800: "#45216F",
          900: "#32184F",
          950: "#211032",
        },
        lime: {
          400: "#D4F88A",
          500: "#C7F464",
          600: "#A8D84D",
          700: "#7CA832",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "var(--font-inter)", "sans-serif"],
        heading: ["var(--font-poppins)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #45216F 0%, #5A2B8A 55%, #6C35A5 100%)",
        "gradient-cta": "linear-gradient(135deg, #C7F464 0%, #D4F88A 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsla(272,51%,43%,0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(79,87%,67%,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(272,51%,43%,0.14) 0px, transparent 50%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "marquee": "marquee 30s linear infinite",
      },
    },
  },
};

export default config;