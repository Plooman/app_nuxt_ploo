/**
 * Wrapper $fetch yang memakai runtimeConfig.public.apiBase.
 * Penting untuk build mobile (Capacitor) — API base harus URL absolut.
 * Di dev/web, apiBase kosong = relative ke origin yang sama.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase || ''

  return $fetch.create({
    baseURL: base,
    credentials: 'include',
  })
}
