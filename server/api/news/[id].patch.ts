import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const patch: Record<string, unknown> = {}
  for (const k of ['title', 'slug', 'content', 'cover_url'] as const) {
    if (body[k] !== undefined) patch[k] = body[k]
  }
  if (body.published !== undefined) {
    patch.published = !!body.published
    if (body.published) patch.published_at = new Date().toISOString()
  }

  if (Object.keys(patch).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const supabase = serverSupabase()
  const { data, error } = await supabase.from('news').update(patch).eq('id', id).select().single()
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return data
})
