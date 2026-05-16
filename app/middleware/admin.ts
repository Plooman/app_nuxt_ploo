import type { UserRole } from '~~/shared/types'

/**
 * Route middleware untuk halaman /admin/**.
 * Allowed default: admin + manager (sesuai matriks akses).
 * Untuk page khusus admin-only (mis. users), tambahkan
 * `definePageMeta({ middleware: 'admin', allowedRoles: ['admin'] })`.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { profile, refresh } = useAuth()
  if (!profile.value) await refresh()

  if (!profile.value) {
    return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  }

  const allowed = (to.meta.allowedRoles as UserRole[] | undefined) ?? ['admin', 'manager']
  if (!allowed.includes(profile.value.role)) {
    return navigateTo('/')
  }
})
