-- =============================================================
-- Migration: 003_email_blocks.sql
-- Status: PENDING
-- Tanggal apply: -
-- Deskripsi: Tabel email_blocks untuk menyimpan email yang
--            ditolak pemiliknya agar tidak bisa digunakan
--            untuk mendaftar ulang.
-- Dibutuhkan oleh: server/api/auth/check-email.get.ts
--                  server/api/auth/reject-email.post.ts
-- =============================================================

CREATE TABLE IF NOT EXISTS public.email_blocks (
  email      TEXT        PRIMARY KEY,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS aktif tanpa policy = client (anon/authenticated key) tidak bisa akses sama sekali.
-- Service role di server tetap bypass RLS dan bisa baca/tulis normal.
ALTER TABLE public.email_blocks ENABLE ROW LEVEL SECURITY;
