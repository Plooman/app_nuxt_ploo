import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Server-only Supabase client memakai service_role key.
 * Bypass RLS — gunakan HANYA di server/api dan jangan pernah expose ke client.
 */
export function serverSupabase(): SupabaseClient {
  if (_client) return _client

  const config = useRuntimeConfig()
  const url = process.env.SUPABASE_URL
  const serviceKey = config.supabaseSecretKey || process.env.NUXT_SUPABASE_SECRET_KEY

  if (!url || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase server credentials are not configured (SUPABASE_URL / NUXT_SUPABASE_SECRET_KEY).',
    })
  }

  _client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _client
}
