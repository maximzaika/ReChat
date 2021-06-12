module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        p: "#008EF4",
        "p-light": "#66beff",
        "p-dark": "#0061c1",
        s: "#91b8f4",
        "s-light": "#c4eaff",
        "s-dark": "#5f88c1",
      },
      animation: {
        "my-slow": "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
      },
      maxWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
        "500px": "500px",
        "1440px": "1440px",
      },
      borderWidth: {
        6: "6px",
      },
    },
  },
  variants: {
    extend: {
      fill: ["first"],
      textColor: ["disabled"],
      backgroundColor: ["disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [],
};
