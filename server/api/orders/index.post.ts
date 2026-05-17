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

  for (const item of body.items) {
    if (!item.product_id || !item.qty || item.qty < 1) {
      throw createError({ statusCode: 400, statusMessage: 'qty minimal 1' })
    }
  }

  const supabase = serverSupabase()

  // Gunakan RPC atomic untuk menghindari race condition pada stock.
  // Pastikan fungsi create_order_atomic sudah dijalankan di Supabase SQL Editor
  // (lihat supabase/schema.sql bagian "Atomic order creation").
  const { data: orderId, error } = await supabase.rpc('create_order_atomic', {
    p_user_id: me.id,
    p_items: body.items,
  })

  if (error) {
    if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { id: orderId as string }
})
