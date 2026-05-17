const PUBLIC_ROUTES = ['/login', '/register', '/confirm', '/reject']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_ROUTES.includes(to.path)) return

  const user = useSupabaseUser()
  const { profile, refresh } = useAuth()

  if (!user.value) {
    return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  }

  if (!profile.value) await refresh()

  if (!profile.value) {
    return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  }
})
