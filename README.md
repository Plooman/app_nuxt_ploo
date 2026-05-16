# Ploo — Admin Panel + Mobile (Nuxt + Supabase + Capacitor)

Admin panel untuk mengelola **users**, **produk**, dan **berita**. Siap di-build untuk web (SSR) dan mobile (Capacitor).

## Stack

- **Nuxt 4** (SSR untuk web, static SPA untuk mobile)
- **Supabase** — Auth + Postgres + Storage
- **Nitro `server/api`** — BFF layer. Semua write business logic lewat sini, BUKAN langsung dari client ke Supabase. Saat skala besar nanti, isi `server/api/**` bisa dipindah ke service custom tanpa mengubah client.
- **@nuxt/ui + Tailwind** untuk UI admin
- **Pinia** untuk state
- **Capacitor** untuk build Android (web → static → APK)

## Setup

1. Copy env: `cp .env.example .env`, isi:
   - `SUPABASE_URL`, `SUPABASE_KEY` (anon) — dari Supabase project settings
   - `SUPABASE_SERVICE_KEY` (service_role) — **server-only**, jangan expose ke client
   - `NUXT_PUBLIC_API_BASE` — kosong untuk dev (default same-origin), set ke URL deployed untuk build mobile

2. Jalankan SQL schema: buka Supabase dashboard → SQL Editor → tempel isi `supabase/schema.sql` → Run.

3. Install & dev:

   ```bash
   npm install
   npm run dev
   ```

4. Bootstrap admin pertama:
   - Register lewat `/register`
   - Buka Supabase → Table editor → `profiles` → ubah `role` user pertama ke `admin`

## Role

| Role     | Akses                                                       |
|----------|-------------------------------------------------------------|
| admin    | Semua: users, produk, berita, orders                        |
| manager  | Produk (CRUD) — stok, harga, deskripsi, dst                  |
| user     | Beli produk, baca berita                                     |

Enforcement ada di **`server/api`** (cek `requireRole`). UI hanya hide menu.

## Mobile build (Android)

```bash
# Set NUXT_PUBLIC_API_BASE ke URL produksi dulu (mis. https://api.ploo.com)
npm run mobile:android
```

Flow: `nuxt generate` (build static SPA) → `cap sync` → buka di Android Studio.

Untuk pertama kali, tambah platform Android dulu:

```bash
npx cap add android
```

## Arsitektur & roadmap scaling

```
Client (web SSR / mobile static)
        │
        ▼
Nitro server/api  ◄── service_role key (server only)
        │
        ▼
Supabase (Auth + DB + Storage)
```

Saat user > 1 juta dan Supabase mulai jadi bottleneck:
- Pindahkan `server/api/products/**` dan `orders/**` ke microservice custom (Fastify/Hono/Go).
- Ganti hanya implementasi handler — kontrak ke client tetap sama (`/api/products`, `/api/orders`).
- Auth tetap di Supabase (verifikasi JWT di service custom).
- DB bisa tetap Postgres tapi di-host sendiri / dengan connection pooler terpisah.

## Struktur penting

```
app/
  layouts/{default,admin}.vue
  pages/                    # public + /admin/**
  middleware/admin.ts       # guard /admin/**
  composables/{useAuth,useApi}.ts
  plugins/auth.client.ts    # hydrate profile saat boot
server/
  api/                      # BFF endpoints
  utils/{supabase,auth}.ts  # service client + requireUser/requireRole
shared/types/               # tipe dipakai client & server
supabase/schema.sql         # jalankan di Supabase SQL Editor
capacitor.config.ts         # config mobile
```
