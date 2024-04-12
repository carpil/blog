/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#6F52EA',
        secondary: '#2AADAD',
        dark: '#131314',
        'dark-light': '#23252F',
        'carpil-gray': '#3C404B',
        'error': '#F84800'
      }
    },
  },
  plugins: [],
}
