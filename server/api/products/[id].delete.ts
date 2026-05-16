import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'manager'])
  const id = getRouterParam(event, 'id')!
  const supabase = serverSupabase()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return { ok: true }
})
