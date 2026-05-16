import { requireRole } from '~~/server/utils/auth'
import { serverSupabase } from '~~/server/utils/supabase'
import type { UserRole } from '~~/shared/types'

const ROLES: UserRole[] = ['admin', 'manager', 'user']

export default defineEventHandler(async (event) => {
  const me = await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  const patch: Record<string, unknown> = {}
  if (body.full_name !== undefined) patch.full_name = body.full_name
  if (body.role !== undefined) {
    if (!ROLES.includes(body.role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
    }
    if (id === me.id && body.role !== 'admin') {
      throw createError({ statusCode: 400, statusMessage: 'Cannot demote yourself' })
    }
    patch.role = body.role
  }

  if (Object.keys(patch).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const supabase = serverSupabase()
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', id).select().single()
  if (error) throw createError({ statusCode: 400, statusMessage: error.message })
  return data
})
