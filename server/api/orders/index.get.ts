import { requireUser } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const supabase = serverSupabase()

  let q = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  // User biasa hanya bisa lihat order miliknya. Admin lihat semua.
  if (me.role !== 'admin') q = q.eq('user_id', me.id)

  const { data, error, count } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { items: data ?? [], total: count ?? 0 }
})
