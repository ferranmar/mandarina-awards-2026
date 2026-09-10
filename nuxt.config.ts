export default defineNuxtConfig({
  compatibilityDate: "2024-09-01",
  devtools: { enabled: false },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  css: ["~/assets/main.css"],
  components: [{ path: "~/components/icons", pathPrefix: false }],
  app: {
    head: {
      title: "Premios entre amigos",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },
});
