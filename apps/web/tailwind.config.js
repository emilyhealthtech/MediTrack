/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005c55',
          container: '#0f766e',
          hover: '#115e59',
          light: '#ccfbf1',
          fixed: '#9cf2e8',
        },
        secondary: {
          DEFAULT: '#216963',
          container: '#a8ece5',
        },
        surface: {
          DEFAULT: '#faf8ff',
          dim: '#d2d9f4',
          container: '#eaedff',
          lowest: '#ffffff',
          low: '#f2f3ff',
          high: '#e2e7ff',
          highest: '#dae2fd',
          variant: '#dae2fd',
        },
        'on-surface': {
          DEFAULT: '#131b2e',
          variant: '#3e4947',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#a3faef',
        },
        outline: {
          DEFAULT: '#6e7977',
          variant: '#bdc9c6',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
