import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const supabase = serverSupabase()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return data
})
