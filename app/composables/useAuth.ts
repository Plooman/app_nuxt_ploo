import type { Profile, UserRole } from '~~/shared/types'

/**
 * Auth state untuk client. Profile (termasuk role) di-fetch dari /api/auth/me
 * yang otoritatif di server. Gunakan ini untuk UI gating (hide menu, dst).
 * Enforcement sebenarnya tetap di server/api.
 */
export function useAuth() {
  const supabaseUser = useSupabaseUser()
  const profile = useState<Profile | null>('auth:profile', () => null)
  const pending = useState<boolean>('auth:pending', () => false)

  async function refresh() {
    if (!supabaseUser.value) {
      profile.value = null
      return
    }
    pending.value = true
    try {
      profile.value = await useApi()<Profile>('/api/auth/me')
    } catch {
      profile.value = null
    } finally {
      pending.value = false
    }
  }

  const isAuthed = computed(() => !!supabaseUser.value && !!profile.value)
  const role = computed<UserRole | null>(() => profile.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'admin')
  const isManager = computed(() => role.value === 'manager')
  const canManageProducts = computed(() => role.value === 'admin' || role.value === 'manager')

  return { profile, role, isAuthed, isAdmin, isManager, canManageProducts, pending, refresh }
}
