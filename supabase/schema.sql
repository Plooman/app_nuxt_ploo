-- =============================================================
-- Ploo: Database schema (Supabase / Postgres)
-- Jalankan file ini di Supabase SQL Editor.
-- =============================================================

-- ---------- Enums ----------
do $$ begin
  create type user_role as enum ('admin', 'manager', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'shipped', 'done', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- profiles (1-1 dengan auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Trigger: setiap user baru di auth.users akan dibuatkan row profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null default 0,
  stock int not null default 0,
  image_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_slug_idx on public.products(slug);

-- ---------- news ----------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  cover_url text,
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists news_slug_idx on public.news(slug);
create index if not exists news_published_idx on public.news(published, published_at desc);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  status order_status not null default 'pending',
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty int not null check (qty > 0),
  price_snapshot numeric(12,2) not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- =============================================================
-- RLS — aktifkan di semua tabel.
-- Strategi: client TIDAK punya policy write. Semua write lewat
-- Nitro server pakai service_role (bypass RLS). Client hanya
-- punya SELECT untuk data publik.
-- =============================================================

alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.news        enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- profiles: user bisa baca profile-nya sendiri (untuk session)
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

-- products: semua orang (anon + auth) bisa read
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (true);

-- news: hanya yang published yang bisa dibaca anon
drop policy if exists "news public read" on public.news;
create policy "news public read" on public.news
  for select using (published = true);

-- orders / order_items: user bisa read order miliknya sendiri
drop policy if exists "orders self read" on public.orders;
create policy "orders self read" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "order_items self read" on public.order_items;
create policy "order_items self read" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- Tidak ada policy INSERT/UPDATE/DELETE — write WAJIB lewat service_role di server/api.
