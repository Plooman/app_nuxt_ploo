import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const profile = await requireRole(event, ['admin', 'manager'])
  const body = await readBody(event)

  if (!body?.name || !body?.slug) {
    throw createError({ statusCode: 400, statusMessage: 'name and slug are required' })
  }

  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      price: Number(body.price) || 0,
      stock: Number(body.stock) || 0,
      image_url: body.image_url ?? null,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return data
})
