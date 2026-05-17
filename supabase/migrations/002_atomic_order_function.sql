-- =============================================================
-- Migration: 002_atomic_order_function.sql
-- Status: PENDING  ← ubah ke APPLIED setelah dijalankan
-- Tanggal apply: -
-- Deskripsi: Tambah fungsi create_order_atomic untuk memastikan
--            pembuatan order + decrement stok berjalan dalam satu
--            transaksi (menghindari race condition).
-- Dibutuhkan oleh: server/api/orders/index.post.ts
-- =============================================================

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
  -- Validasi stok + hitung total (FOR UPDATE mengunci baris agar tidak ada
  -- dua transaksi sekaligus yang membaca stok yang sama)
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

  -- Buat order
  insert into public.orders (user_id, status, total)
  values (p_user_id, 'pending', v_total)
  returning id into v_order_id;

  -- Insert items dan kurangi stok
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
