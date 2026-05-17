import { getRequestIP, setResponseHeader, getMethod } from 'h3'

// ─── Konfigurasi limit per path ───────────────────────────────────────────────
// Aturan dibaca dari atas ke bawah; aturan pertama yang cocok dipakai.
// windowMs : durasi jendela waktu dalam milidetik
// max      : jumlah request maksimum dalam jendela tersebut per IP
const RULES = [
  { path: '/api/orders', windowMs: 60_000, max: 20 },   // checkout: 20x/menit
  { path: '/api/auth',   windowMs: 60_000, max: 30 },   // auth: 30x/menit
  { path: '/api/',       windowMs: 60_000, max: 120 },  // API lainnya: 120x/menit
] as const

// ─── In-memory store (cukup untuk single-node / node-server preset) ───────────
// Untuk multi-instance / serverless, ganti dengan Redis.
const store = new Map<string, number[]>()

// Bersihkan entry yang sudah kadaluarsa tiap 5 menit agar memori tidak tumbuh
// terus-menerus pada proses yang berjalan lama.
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of store) {
    if (timestamps.every((t) => now - t > 60_000)) store.delete(key)
  }
}, 5 * 60 * 1000)

// ─── Middleware ────────────────────────────────────────────────────────────────
export default defineEventHandler((event) => {
  // Preflight sudah ditangani oleh middleware CORS — lewatkan saja
  if (getMethod(event) === 'OPTIONS') return

  const path = getRequestURL(event).pathname

  // Rate limit hanya berlaku untuk API routes
  if (!path.startsWith('/api/')) return

  const rule = RULES.find((r) => path.startsWith(r.path))
  if (!rule) return

  // Gunakan IP asli; xForwardedFor: true agar benar di balik reverse proxy
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const key = `${ip}:${rule.path}`
  const now = Date.now()

  // Sliding window: buang timestamp di luar jendela waktu
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < rule.windowMs)

  if (timestamps.length >= rule.max) {
    // Retry-After memberi tahu client kapan boleh coba lagi (dalam detik)
    setResponseHeader(event, 'Retry-After', String(Math.ceil(rule.windowMs / 1000)))
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  timestamps.push(now)
  store.set(key, timestamps)
})
