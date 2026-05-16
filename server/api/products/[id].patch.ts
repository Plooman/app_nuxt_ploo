import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'manager'])
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of ['name', 'slug', 'description', 'image_url'] as const) {
    if (body[k] !== undefined) patch[k] = body[k]
  }
  if (body.price !== undefined) patch.price = Number(body.price)
  if (body.stock !== undefined) patch.stock = Number(body.stock)

  const supabase = serverSupabase()
  const { data, error } = await supabase.from('products').update(patch).eq('id', id).select().single()
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return data
})
