import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { serverSupabase } from './supabase'
import type { Profile, UserRole } from '~~/shared/types'

/**
 * Pastikan ada user yang login. Mengembalikan profile lengkap (termasuk role).
 * Throw 401 kalau belum auth.
 */
export async function requireUser(event: H3Event): Promise<Profile> {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 401, statusMessage: 'Profile not found' })
  }

  return data as Profile
}

/**
 * Pastikan user login DAN role-nya termasuk yang diizinkan.
 * Throw 403 kalau role tidak match.
 */
export async function requireRole(event: H3Event, allowed: UserRole[]): Promise<Profile> {
  const profile = await requireUser(event)
  if (!allowed.includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return profile
}
