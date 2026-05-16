import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Number(query.offset) || 0

  const supabase = serverSupabase()
  const { data, error, count } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { items: data ?? [], total: count ?? 0 }
})
