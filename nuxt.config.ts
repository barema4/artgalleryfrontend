// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  pinia: {
    storesDirs: ['./app/stores/**'],
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api/v1',
    },
  },
  routeRules: {
    '/api/v1/**': {
      proxy: 'http://localhost:3001/api/v1/**',
    },
  },
})