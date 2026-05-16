import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Number(query.offset) || 0
  const search = (query.q as string) || ''

  const supabase = serverSupabase()
  let q = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) q = q.ilike('name', `%${search}%`)

  const { data, error, count } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { items: data ?? [], total: count ?? 0 }
})
