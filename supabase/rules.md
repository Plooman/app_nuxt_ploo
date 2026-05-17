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

### 5. Setelah membuat migration, update juga `schema.sql`

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
