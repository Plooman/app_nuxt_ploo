# Ploo — E-Commerce + CMS (Nuxt + Supabase + Capacitor)

Aplikasi e-commerce dengan panel admin untuk mengelola **produk**, **berita**, **users**, dan **pesanan**. Mendukung web (SSR/Node) dan mobile (Capacitor/Android).

---

## Fitur

### Untuk Semua User (setelah login)
- Katalog produk dengan pencarian
- Detail produk — pilih jumlah, tambah ke keranjang
- Keranjang belanja (disimpan di localStorage)
- Checkout — buat pesanan, stok berkurang secara atomik
- Riwayat pesanan + detail per pesanan
- Edit profil (nama lengkap)
- Baca berita / artikel

### Panel Admin (`/admin`)
| Halaman | Role yang bisa akses |
|---|---|
| Dashboard (statistik) | admin, manager |
| Manajemen Produk (CRUD) | admin, manager |
| Manajemen Berita (CRUD, draft/publish) | admin |
| Manajemen Users (ubah role, hapus) | admin |
| Manajemen Orders (update status) | admin |

---

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Nuxt 4 + Vue 3 |
| Database + Auth | Supabase (PostgreSQL) |
| Server API | Nitro (`server/api/`) — BFF layer |
| UI | @nuxt/ui + Tailwind CSS |
| State | Pinia (cart) + `useState` Nuxt (auth) |
| Mobile | Capacitor v8 (Android) |

> Semua write business logic lewat `server/api/` menggunakan `service_role` key.
> Client **tidak pernah** menulis langsung ke Supabase. Ini memudahkan migrasi ke microservice jika skala membesar.

---

## Setup Lokal

### 1. Clone & install

```bash
git clone <repo-url>
cd app-nuxt-ploo
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Isi `.env`:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...                      # anon key (client-safe)
SUPABASE_SERVICE_KEY=eyJ...              # service_role key (server-only, JANGAN expose)
NUXT_PUBLIC_API_BASE=                    # kosong untuk dev, isi URL produksi untuk mobile
```

### 3. Setup database Supabase

Buka **Supabase Dashboard → SQL Editor**, lalu:

**Jika database masih kosong (fresh):**
Copy seluruh isi `supabase/schema.sql` → paste → Run.

**Jika database sudah ada (tim yang bergabung / update):**
Buka folder `supabase/migrations/`, cari file dengan status `PENDING`,
jalankan satu per satu secara urut di SQL Editor.

> Lihat `supabase/rules.md` untuk aturan lengkap pengelolaan migration.

### 4. Jalankan dev server

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

### 5. Buat akun admin pertama

1. Register lewat `/register`
2. Buka Supabase → Table Editor → tabel `profiles`
3. Ubah kolom `role` user tersebut dari `user` → `admin`
4. Login kembali — menu Admin akan muncul

---

## Role & Akses

| Role | Keterangan |
|---|---|
| `admin` | Akses penuh: semua panel + manage users |
| `manager` | Hanya bisa kelola produk (CRUD) |
| `user` | Belanja, lihat pesanan, edit profil |

Enforcement role ada di **`server/api/`** via `requireRole()`. Tampilan UI hanya menyembunyikan menu.

---

## Struktur Folder

```
app/
├── composables/
│   ├── useAuth.ts          # state auth global (profile, role, isAdmin, dll)
│   └── useApi.ts           # $fetch dengan auth header otomatis
├── stores/
│   └── cart.ts             # Pinia store keranjang belanja (localStorage)
├── layouts/
│   ├── default.vue         # Layout publik + member (navbar)
│   └── admin.vue           # Layout panel admin (sidebar)
├── middleware/
│   ├── auth.global.ts      # Redirect ke /login jika belum auth
│   └── admin.ts            # Guard /admin/** berdasarkan role
├── pages/
│   ├── index.vue           # Katalog produk
│   ├── login.vue / register.vue / confirm.vue
│   ├── profile.vue         # Edit profil user
│   ├── cart.vue            # Keranjang belanja + checkout
│   ├── products/[id].vue   # Detail produk
│   ├── news/               # Daftar & detail berita
│   ├── orders/             # Riwayat & detail pesanan
│   └── admin/              # Panel admin (products, news, users, orders)
└── plugins/
    ├── auth.client.ts      # Hydrate profile saat boot
    └── cart.client.ts      # Load cart dari localStorage saat boot

server/
├── api/
│   ├── auth/me.get.ts      # GET profile
│   ├── auth/me.patch.ts    # PATCH update profil
│   ├── products/           # CRUD produk
│   ├── news/               # CRUD berita
│   ├── orders/             # Buat & kelola pesanan
│   └── users/              # Kelola users (admin only)
└── utils/
    ├── auth.ts             # requireUser(), requireRole()
    └── supabase.ts         # Supabase client (service_role)

shared/types/index.ts       # Tipe TypeScript shared (client + server)

supabase/
├── schema.sql              # Skema lengkap — untuk fresh install
├── rules.md                # Aturan pengelolaan migration (baca dulu!)
└── migrations/             # Riwayat perubahan database bertahap
    ├── 001_initial_schema.sql              [APPLIED]
    └── 002_atomic_order_function.sql       [PENDING]

capacitor.config.ts         # Konfigurasi build mobile Android
```

---

## Alur Pesanan

```
User pilih produk → tambah ke keranjang (localStorage)
       ↓
Halaman /cart → klik Checkout
       ↓
POST /api/orders → RPC create_order_atomic (PostgreSQL transaction)
  - validasi stok (FOR UPDATE lock)
  - buat order + order_items
  - decrement stok secara atomik
       ↓
Redirect ke /orders/:id (detail pesanan)
       ↓
Admin ubah status: pending → paid → shipped → done
```

---

## Mobile Build (Android)

```bash
# Pertama kali — tambah platform Android
npx cap add android

# Build
npm run mobile:android
# = nuxt generate → cap sync → buka Android Studio
```

Set `NUXT_PUBLIC_API_BASE` ke URL produksi sebelum build:
```env
NUXT_PUBLIC_API_BASE=https://api.ploo.com
```

---

## Deployment Web

```bash
npm run build
node .output/server/index.mjs
```

Atau gunakan platform seperti Railway, Render, atau VPS dengan Node.js. Preset Nitro sudah dikonfigurasi ke `node-server`.

---

## Arsitektur & Scaling

```
Client (web SSR / mobile static)
        │
        ▼
Nitro server/api  ◄── service_role key (server only)
        │
        ▼
Supabase (Auth + DB + RLS)
```

Ketika trafik besar dan Supabase mulai jadi bottleneck:
- Pindahkan handler `server/api/products/**` dan `orders/**` ke microservice terpisah (Hono/Fastify/Go).
- Kontrak API ke client **tidak berubah** — hanya ganti implementasi handler.
- Auth tetap Supabase — verifikasi JWT di service custom.
- DB bisa tetap PostgreSQL di-host sendiri dengan connection pooler (PgBouncer/Supavisor).
