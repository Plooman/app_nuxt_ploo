import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { serverSupabase } from './supabase'
import type { Profile, UserRole } from '~~/shared/types'

export async function requireUser(event: H3Event): Promise<Profile> {
  const supabase = serverSupabase()
  let userId: string | null = null

  // Cek Authorization header terlebih dahulu (untuk mobile/Capacitor)
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) userId = user.id
  }

  // Fallback ke cookie session (untuk web)
  if (!userId) {
    const user = await serverSupabaseUser(event)
    if (user) userId = user.id
  }

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
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
