module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* hotelBrown: '#7B3F00' - main brown 
        hotelGold: '#FFD700' - gold */
      },
      backgroundImage: {
        'hero': "url('/assets/images/hero_image.svg')",
      },
    },
  },
  plugins: [],
};
