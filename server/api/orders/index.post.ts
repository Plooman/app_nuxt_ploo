import { requireUser } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

interface CartLine {
  product_id: string
  qty: number
}

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const body = await readBody<{ items: CartLine[] }>(event)

  if (!Array.isArray(body?.items) || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'items required' })
  }

  const supabase = serverSupabase()
  const ids = body.items.map((i) => i.product_id)
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, price, stock')
    .in('id', ids)
  if (pErr) throw createError({ statusCode: 500, statusMessage: pErr.message })

  // Validasi stok + hitung total dengan price snapshot dari DB (bukan dari client).
  let total = 0
  const lines: { product_id: string; qty: number; price_snapshot: number }[] = []
  for (const line of body.items) {
    const prod = products?.find((p) => p.id === line.product_id)
    if (!prod) throw createError({ statusCode: 400, statusMessage: `Product ${line.product_id} not found` })
    if (line.qty < 1) throw createError({ statusCode: 400, statusMessage: 'qty must be >= 1' })
    if (prod.stock < line.qty) {
      throw createError({ statusCode: 400, statusMessage: `Insufficient stock for ${prod.id}` })
    }
    total += Number(prod.price) * line.qty
    lines.push({ product_id: prod.id, qty: line.qty, price_snapshot: Number(prod.price) })
  }

  const { data: order, error: oErr } = await supabase
    .from('orders')
    .insert({ user_id: me.id, status: 'pending', total })
    .select()
    .single()
  if (oErr) throw createError({ statusCode: 500, statusMessage: oErr.message })

  const { error: iErr } = await supabase
    .from('order_items')
    .insert(lines.map((l) => ({ ...l, order_id: order.id })))
  if (iErr) throw createError({ statusCode: 500, statusMessage: iErr.message })

  // Decrement stok. Catatan: bukan transaksi atomik — saat skala besar pindahkan
  // ke RPC/stored procedure atau service custom yang punya transaksi DB nyata.
  for (const l of lines) {
    const prod = products!.find((p) => p.id === l.product_id)!
    await supabase
      .from('products')
      .update({ stock: prod.stock - l.qty })
      .eq('id', l.product_id)
  }

  return order
})
