import { requireUser } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const body = await readBody<{ full_name?: string }>(event)

  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: body.full_name ?? me.full_name })
    .eq('id', me.id)
    .select('id, email, full_name, role, created_at')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
