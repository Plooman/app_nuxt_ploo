import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'
import type { OrderStatus } from '~~/shared/types'

const VALID_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'done', 'cancelled']

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: `status harus salah satu dari: ${VALID_STATUSES.join(', ')}` })
  }

  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('orders')
    .update({ status: body.status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return data
})
