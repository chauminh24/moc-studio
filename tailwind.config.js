// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust this path to your source folder
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FE6C23',
        secondary: '#76B3D0',
        accent: '#FFE9CA',
        'bg-light': '#FFFFFF',
        'bg-dark': '#1A1A1A',
        'text-light': '#000000',
        'text-dark': '#F5F5F5',
      },
      letterSpacing: {
        'extra-wide': '0.2em', // Customize the value as needed
      },
    },
  },
  plugins: [],
};
