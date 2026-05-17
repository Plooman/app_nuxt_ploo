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
      exclude: ['/login', '/register', '/confirm', '/reject'],
    },
    types: false,
  },

  // ─── Security Headers ────────────────────────────────────────────────────────
  // Berlaku untuk semua route. Diterapkan di level Nitro sebelum response keluar.
  routeRules: {
    '/**': {
      headers: {
        // Cegah halaman dimuat dalam <iframe> di domain lain (clickjacking)
        'X-Frame-Options': 'DENY',

        // Cegah browser menebak tipe konten sendiri (MIME sniffing)
        'X-Content-Type-Options': 'nosniff',

        // Nonaktifkan DNS prefetch agar tidak bocorkan URL yang dikunjungi user
        'X-DNS-Prefetch-Control': 'off',

        // Hanya kirim origin sebagai Referer ke HTTPS, path tidak dikirim ke HTTP
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // Nonaktifkan fitur browser yang tidak dipakai aplikasi ini
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

        // Content Security Policy — batasi dari mana resource boleh dimuat.
        // unsafe-inline diperlukan untuk hydration script & style dari Nuxt/Vue.
        // connect-src mengizinkan koneksi ke Supabase (HTTPS + WebSocket).
        // Untuk production yang lebih ketat, unsafe-inline bisa diganti dengan nonce.
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "font-src 'self'",
          "frame-ancestors 'none'",
        ].join('; '),
      },
    },

    // Endpoint API tidak boleh di-cache oleh browser atau CDN
    '/api/**': {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  },

  runtimeConfig: {
    supabaseSecretKey: '',
    public: {
      apiBase: '',
    },
  },

  nitro: {
    preset: 'node-server',
  },
})
