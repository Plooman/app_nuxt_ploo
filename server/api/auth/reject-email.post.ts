import { serverSupabase } from '~~/server/utils/supabase'

interface RejectBody {
  email: string
  token: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RejectBody>(event)
  const email = body?.email?.toLowerCase().trim()
  const token = body?.token?.trim()

  // ── Validasi input ───────────────────────────────────────────
  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid' })
  }
  if (!token || !/^\d{6}$/.test(token)) {
    throw createError({ statusCode: 400, statusMessage: 'Token tidak valid' })
  }

  const supabase = serverSupabase()

  // ── 1. Sudah diblokir? Return sukses (idempotent) ────────────
  const { data: existingBlock } = await supabase
    .from('email_blocks')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (existingBlock) {
    return { success: true, alreadyBlocked: true }
  }

  // ── 2. Cari user di profiles berdasarkan email ───────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!profile) {
    // Email belum terdaftar — blokir saja untuk cegah pendaftaran berikutnya
    await supabase.from('email_blocks').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
    return { success: true }
  }

  // ── 3. Cek apakah akun sudah dikonfirmasi via admin API ──────
  const { data: adminData, error: adminError } = await supabase.auth.admin.getUserById(profile.id)

  if (adminError || !adminData?.user) {
    throw createError({ statusCode: 500, statusMessage: 'Tidak dapat memverifikasi status akun' })
  }

  if (adminData.user.email_confirmed_at) {
    // Akun sudah aktif — jangan hapus, blokir saja email untuk cegah re-registrasi
    await supabase.from('email_blocks').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
    throw createError({
      statusCode: 409,
      statusMessage: 'Akun ini sudah dikonfirmasi dan tidak dapat dihapus melalui fitur ini',
    })
  }

  // ── 4. Hapus akun yang belum dikonfirmasi (cascade ke profiles) ──
  const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.id)
  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: deleteError.message })
  }

  // ── 5. Blokir email ──────────────────────────────────────────
  await supabase.from('email_blocks').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })

  return { success: true }
})
