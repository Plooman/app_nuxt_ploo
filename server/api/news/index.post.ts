import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const profile = await requireRole(event, ['admin'])
  const body = await readBody(event)

  if (!body?.title || !body?.slug) {
    throw createError({ statusCode: 400, statusMessage: 'title and slug are required' })
  }

  const published = !!body.published
  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('news')
    .insert({
      title: body.title,
      slug: body.slug,
      content: body.content ?? null,
      cover_url: body.cover_url ?? null,
      published,
      published_at: published ? new Date().toISOString() : null,
      author_id: profile.id,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return data
})
