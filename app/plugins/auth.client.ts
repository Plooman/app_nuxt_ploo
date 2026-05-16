/**
 * Saat app start (client), fetch /api/auth/me untuk hydrate profile + role.
 * Juga refresh ketika session Supabase berubah.
 */
export default defineNuxtPlugin(async () => {
  const supabaseUser = useSupabaseUser()
  const { refresh } = useAuth()

  await refresh()

  watch(supabaseUser, async () => {
    await refresh()
  })
})
