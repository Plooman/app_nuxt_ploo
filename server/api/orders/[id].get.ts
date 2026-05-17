import { requireUser } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const id = getRouterParam(event, 'id')!
  const supabase = serverSupabase()

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .eq('id', id)
    .single()

  if (error) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  if (me.role !== 'admin' && data.user_id !== me.id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return data
})
