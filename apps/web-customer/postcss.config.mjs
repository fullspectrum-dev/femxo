// Tailwind's official Next.js setup. Next tracks PostCSS inputs, so a changed
// globals.css always rebuilds, even when the build cache is restored.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
