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
  const viewAs = useCookie<UserRole | null>('admin:view-as', {
    default: () => null,
    maxAge: 3600,
    sameSite: 'lax',
  })

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

  // role asli di database — tidak pernah berubah
  const isAdmin = computed(() => profile.value?.role === 'admin')

  // effectiveRole: role yang aktif saat ini (admin bisa simulasikan role lain)
  const effectiveRole = computed<UserRole | null>(() =>
    isAdmin.value && viewAs.value ? viewAs.value : (profile.value?.role ?? null)
  )

  function setViewAs(r: UserRole | null) {
    if (!isAdmin.value) return
    viewAs.value = r
  }

  const isAuthed = computed(() => !!supabaseUser.value && !!profile.value)
  const role = computed<UserRole | null>(() => profile.value?.role ?? null)
  const effectiveIsAdmin = computed(() => effectiveRole.value === 'admin')
  const isManager = computed(() => effectiveRole.value === 'manager')
  const canManageProducts = computed(() =>
    effectiveRole.value === 'admin' || effectiveRole.value === 'manager'
  )

  return {
    profile, role, effectiveRole, viewAs,
    isAuthed, isAdmin, effectiveIsAdmin, isManager, canManageProducts,
    pending, refresh, setViewAs,
  }
}
