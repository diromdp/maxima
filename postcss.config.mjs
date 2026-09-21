const config = {
  plugins: {
    // Tailwind terakhir: utilitasnya harus bisa menimpa apa pun yang lewat
    // dulu — lihat urutan layer di app/globals.css.
    "postcss-preset-mantine": {},
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-xs": "36em",
        "mantine-breakpoint-sm": "48em",
        "mantine-breakpoint-md": "62em",
        "mantine-breakpoint-lg": "75em",
        "mantine-breakpoint-xl": "88em",
      },
    },
    "@tailwindcss/postcss": {},
  },
}

export default config
