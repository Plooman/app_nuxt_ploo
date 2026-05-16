import { serverSupabase } from '~~/server/utils/supabase'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Number(query.offset) || 0
  const onlyPublished = query.all !== '1'

  // Admin/manager bisa lihat semua (termasuk draft). Lainnya hanya published.
  let canSeeDraft = false
  const user = await serverSupabaseUser(event)
  if (user) {
    const sb = serverSupabase()
    const { data } = await sb.from('profiles').select('role').eq('id', user.id).single()
    canSeeDraft = data?.role === 'admin'
  }

  const supabase = serverSupabase()
  let q = supabase
    .from('news')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (onlyPublished || !canSeeDraft) q = q.eq('published', true)

  const { data, error, count } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { items: data ?? [], total: count ?? 0 }
})
