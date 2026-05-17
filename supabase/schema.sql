-- =============================================================
-- Ploo: Complete Database Schema (Supabase / PostgreSQL)
-- =============================================================
-- File ini adalah GAMBARAN LENGKAP database saat ini.
-- Gunakan untuk setup database baru (fresh install).
--
-- Untuk perubahan bertahap, lihat folder migrations/:
--   migrations/001_initial_schema.sql              [APPLIED]
--   migrations/002_atomic_order_function.sql        [PENDING]
--   migrations/003_email_blocks.sql                 [PENDING]
--
-- Aturan pengelolaan migration → supabase/rules.md
--
-- Cara kerja:
--   - Fresh database  → jalankan file ini saja (schema.sql)
--   - Database lama   → jalankan HANYA file migrations/ yang berstatus PENDING
--   - Setelah apply   → ubah status file migration dari PENDING → APPLIED
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

-- ---------- email_blocks ----------
create table if not exists public.email_blocks (
  email      text        primary key,
  blocked_at timestamptz not null default now()
);
-- RLS aktif tanpa policy = client tidak bisa akses; service_role tetap bypass
alter table public.email_blocks enable row level security;

-- ---------- RLS ----------
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.news        enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (true);

drop policy if exists "news public read" on public.news;
create policy "news public read" on public.news
  for select using (published = true);

drop policy if exists "orders self read" on public.orders;
create policy "orders self read" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "order_items self read" on public.order_items;
create policy "order_items self read" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- ---------- Functions ----------
create or replace function public.create_order_atomic(
  p_user_id uuid,
  p_items jsonb
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_total    numeric(12,2) := 0;
  v_item     jsonb;
  v_prod     record;
  v_qty      int;
  v_pid      uuid;
begin
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::int;

    select price, stock into v_prod
    from public.products
    where id = v_pid
    for update;

    if not found then
      raise exception 'Product % not found', v_pid;
    end if;
    if v_prod.stock < v_qty then
      raise exception 'Insufficient stock for product %', v_pid;
    end if;

    v_total := v_total + v_prod.price * v_qty;
  end loop;

  insert into public.orders (user_id, status, total)
  values (p_user_id, 'pending', v_total)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::int;

    insert into public.order_items (order_id, product_id, qty, price_snapshot)
    select v_order_id, id, v_qty, price
    from public.products
    where id = v_pid;

    update public.products
    set stock = stock - v_qty, updated_at = now()
    where id = v_pid;
  end loop;

  return v_order_id;
end;
$$;
