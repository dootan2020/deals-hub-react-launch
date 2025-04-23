
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/styles/**/*.{css,scss}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          'dark': '#27AE60',
          foreground: 'hsl(var(--primary-foreground))',
        },
        accent: {
          DEFAULT: '#3498DB',
          'dark': '#2980B9',
          foreground: 'hsl(var(--accent-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        text: {
          DEFAULT: '#333333',
          'light': '#666666',
        },
        background: '#FFFFFF',
        'background-secondary': '#F9FAFB',
        error: '#E74C3C',
        warning: '#F1C40F',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
