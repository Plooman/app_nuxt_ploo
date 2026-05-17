# Aturan Pengelolaan Database (Supabase)

Baca ini sebelum membuat perubahan apapun pada skema database.

---

## Dua File yang Harus Selalu Sinkron

### `schema.sql`
Gambaran **lengkap dan terkini** dari seluruh database.
- Berisi semua tabel, enum, trigger, RLS policy, dan function.
- Digunakan untuk setup database baru (fresh install) — cukup copy-paste dan jalankan sekali.
- **Wajib diperbarui** setiap kali ada migration baru.

### `migrations/NNN_nama_perubahan.sql`
Perubahan **bertahap** yang dijalankan satu per satu pada database yang sudah ada.
- Setiap file hanya berisi perubahan baru (bukan ulang dari awal).
- Header file mencatat status apply: `PENDING` atau `APPLIED`.

---

## Aturan Wajib

### 1. Setiap perubahan database = buat file migration baru

Jangan modifikasi isi migration yang sudah `APPLIED`. Buat file baru.

```
migrations/
  001_initial_schema.sql          ← APPLIED (jangan diubah)
  002_atomic_order_function.sql   ← APPLIED (jangan diubah)
  003_nama_perubahan_kamu.sql     ← PENDING (yang baru)
```

### 2. Nomor urut selalu naik, tidak pernah mundur

Format nama file: `NNN_deskripsi_singkat.sql`
- Gunakan 3 digit: `001`, `002`, `003`, ..., `099`, `100`, dst.
- Deskripsi singkat, huruf kecil, pakai underscore.

Contoh nama yang baik:
```
003_add_column_phone_to_profiles.sql
004_add_table_categories.sql
005_add_rls_policy_categories.sql
```

### 3. Header wajib ada di setiap file migration

Salin template ini ke setiap file migration baru:

```sql
-- =============================================================
-- Migration: NNN_nama_perubahan.sql
-- Status: PENDING  ← ubah ke APPLIED setelah dijalankan
-- Tanggal apply: -  ← isi tanggal setelah dijalankan
-- Deskripsi: Jelaskan apa yang diubah dan mengapa.
-- =============================================================
```

### 4. Setelah menjalankan migration di Supabase

Segera perbarui file migration-nya:
```sql
-- Status: APPLIED        ← dari PENDING
-- Tanggal apply: 2026-05-XX  ← isi tanggal hari ini
```

### 5. Setiap tabel WAJIB mengaktifkan Row Level Security (RLS)

Supabase menggunakan `anon key` dan `authenticated key` yang bisa diakses dari browser.
Tanpa RLS, siapa pun bisa membaca atau memodifikasi data tabel tersebut secara langsung.

**Aturan:**
- Setiap `CREATE TABLE` **harus** diikuti `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Tambahkan policy sesuai kebutuhan akses:

| Skenario | Yang dilakukan |
|----------|---------------|
| Tabel hanya diakses server (service role) | Aktifkan RLS, **tanpa policy** — client tidak bisa akses sama sekali |
| User hanya bisa baca datanya sendiri | Aktifkan RLS + policy `FOR SELECT USING (auth.uid() = user_id)` |
| Data publik bisa dibaca siapa saja | Aktifkan RLS + policy `FOR SELECT USING (true)` |
| User bisa tulis datanya sendiri | Aktifkan RLS + policy `FOR INSERT/UPDATE/DELETE WITH CHECK (auth.uid() = user_id)` |

**Contoh tabel server-only (tanpa client access):**
```sql
CREATE TABLE public.email_blocks (
  email TEXT PRIMARY KEY,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- RLS aktif tanpa policy = client tidak bisa akses; service_role tetap bypass
ALTER TABLE public.email_blocks ENABLE ROW LEVEL SECURITY;
```

**Contoh tabel dengan akses user sendiri:**
```sql
CREATE TABLE public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  content text
);
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes self read" ON public.user_notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes self write" ON public.user_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

> **Catatan:** `service_role` key (digunakan di server) selalu bypass RLS — jadi mengaktifkan RLS tidak akan mempengaruhi endpoint server sama sekali.

### 6. Setelah membuat migration, update juga `schema.sql`

`schema.sql` harus selalu mencerminkan state database yang **paling baru**.
Tambahkan atau modifikasi bagian yang relevan di `schema.sql`.

Perbarui juga daftar migration di bagian komentar atas `schema.sql`:
```sql
-- migrations/001_initial_schema.sql              [APPLIED]
-- migrations/002_atomic_order_function.sql        [APPLIED]
-- migrations/003_nama_perubahan_kamu.sql          [PENDING]  ← tambahkan ini
```

---

## Alur Kerja Singkat

```
Ada perubahan DB?
       │
       ▼
Buat file migrations/NNN_xxx.sql
(Status: PENDING)
       │
       ▼
Tambahkan perubahan ke schema.sql
       │
       ▼
Jalankan file PENDING di Supabase SQL Editor
       │
       ▼
Ubah status file migration → APPLIED + isi tanggal
       │
       ▼
Commit kedua file (migration + schema.sql) sekaligus
```

---

## Cara Setup Database

### Fresh database (baru pertama kali)
Jalankan `schema.sql` saja — sudah lengkap.

### Database yang sudah ada
Cari file migration dengan status `PENDING`, jalankan satu per satu secara urut:
```sql
-- Contoh: jalankan 003 dulu, baru 004, dst.
```

---

## Yang Tidak Boleh Dilakukan

- Jangan edit langsung di Supabase dashboard tanpa membuat file migration.
- Jangan ubah isi migration yang sudah `APPLIED`.
- Jangan lupa update `schema.sql` setelah membuat migration baru.
- Jangan jalankan `schema.sql` pada database yang sudah ada isinya
  (kecuali semua statement sudah aman dengan `IF NOT EXISTS` / `OR REPLACE`).
- **Jangan buat tabel tanpa `ENABLE ROW LEVEL SECURITY`** — Supabase akan memperingatkan
  dan client bisa mengakses data secara langsung menggunakan anon/authenticated key.
