import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const me = await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')!
  if (id === me.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete yourself' })
  }

  const supabase = serverSupabase()
  // Hapus dari auth.users akan cascade ke profiles via FK.
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return { ok: true }
})
