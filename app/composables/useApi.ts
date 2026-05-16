export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase || ''
  const supabase = useSupabaseClient()

  return $fetch.create({
    baseURL: base,
    credentials: 'include',
    async onRequest({ options }) {
      if (import.meta.server) return
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        const headers = new Headers(options.headers as HeadersInit)
        headers.set('Authorization', `Bearer ${session.access_token}`)
        options.headers = headers
      }
    },
  })
}
