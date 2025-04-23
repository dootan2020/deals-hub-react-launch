
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/styles/**/*.{css,scss}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
