// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/products/**', '/news/**', '/register', '/login'],
    },
  },

  runtimeConfig: {
    supabaseServiceKey: '',
    public: {
      apiBase: '',
    },
  },

  nitro: {
    preset: 'node-server',
  },
})
