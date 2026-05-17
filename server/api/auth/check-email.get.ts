import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = (query.email as string | undefined)?.toLowerCase().trim()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid' })
  }

  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('email_blocks')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { blocked: data !== null }
})
