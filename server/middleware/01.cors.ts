import { getRequestHeader, setResponseHeaders, getMethod, setResponseStatus } from 'h3'

// Isi CORS_ALLOWED_ORIGINS di .env dengan domain yang diizinkan, pisahkan koma.
// Contoh: http://localhost:3000,https://ploo.com
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, 'origin') ?? ''

  // Hanya set CORS headers jika origin termasuk dalam whitelist.
  // Request tanpa Origin header (curl, server-to-server) dibiarkan lewat.
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      // Browser meng-cache preflight result selama 24 jam (dalam detik)
      'Access-Control-Max-Age': '86400',
    })
  }

  // Preflight request (OPTIONS) — balas langsung 204 No Content, tidak diteruskan
  // ke route handler. Browser mengirim ini sebelum request "berbahaya" (POST, dll).
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
