<template>
  <div>
    <!-- ── Form pendaftaran ──────────────────────────── -->
    <template v-if="step === 'form'">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Buat akun baru</h2>
      <p class="text-gray-500 text-sm mb-6">Isi data berikut untuk mendaftar</p>
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama lengkap</label>
          <input
            v-model="fullName"
            required
            placeholder="Nama Anda"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="nama@email.com"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="Minimal 6 karakter"
            class="input-field"
          />
        </div>
        <div
          v-if="formError"
          class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
        >
          <span class="mt-0.5">⚠️</span>
          {{ formError }}
        </div>
        <button
          :disabled="loading"
          class="w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {{ loading ? 'Memproses...' : 'Daftar' }}
        </button>
      </form>
      <p class="text-sm mt-5 text-center text-gray-600">
        Sudah punya akun?
        <NuxtLink to="/login" class="text-slate-900 font-semibold hover:underline">Masuk di sini</NuxtLink>
      </p>
    </template>

    <!-- ── Pesan sukses setelah daftar ──────────────── -->
    <template v-else>
      <div class="text-center">
        <!-- Ikon berbeda untuk resent vs baru -->
        <div
          :class="sentContext === 'resent' ? 'bg-amber-100' : 'bg-green-100'"
          class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
        >
          {{ sentContext === 'resent' ? '🔄' : '✉️' }}
        </div>

        <!-- Daftar baru -->
        <template v-if="sentContext === 'new'">
          <h2 class="text-xl font-bold text-gray-900 mb-2">Cek email Anda</h2>
          <p class="text-gray-500 text-sm leading-relaxed mb-1">Link konfirmasi telah dikirim ke</p>
          <p class="font-semibold text-gray-800 text-sm mb-5 truncate">{{ email }}</p>
          <p class="text-xs text-gray-400 leading-relaxed">
            Klik link di email untuk mengaktifkan akun Anda.<br>
            Periksa folder spam jika tidak ada dalam beberapa menit.
          </p>
        </template>

        <!-- Pernah daftar tapi belum konfirmasi -->
        <template v-else-if="sentContext === 'resent'">
          <h2 class="text-xl font-bold text-gray-900 mb-2">Email konfirmasi dikirim ulang</h2>
          <p class="text-gray-500 text-sm leading-relaxed mb-1">
            Anda pernah mendaftar dengan email ini namun belum mengkonfirmasinya.
          </p>
          <p class="font-semibold text-gray-800 text-sm mb-3 truncate">{{ email }}</p>
          <p class="text-xs text-gray-400 leading-relaxed">
            Kami telah mengirimkan ulang link konfirmasi ke email Anda.<br>
            Klik link di email untuk mengaktifkan akun. Periksa folder spam jika perlu.
          </p>
        </template>

        <button
          class="mt-6 text-sm text-slate-600 hover:text-slate-900 underline"
          @click="step = 'form'"
        >
          Kembali ke form
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
.input-field {
  @apply w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all;
}
</style>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()

const step = ref<'form' | 'sent'>('form')
const sentContext = ref<'new' | 'resent'>('new')
const fullName = ref('')
const email = ref('')
const password = ref('')
const formError = ref<string | null>(null)
const loading = ref(false)

async function submitForm() {
  loading.value = true
  formError.value = null

  try {
    const res = await $fetch<{ blocked: boolean }>('/api/auth/check-email', {
      query: { email: email.value },
    })
    if (res.blocked) {
      formError.value = 'Email ini tidak dapat digunakan untuk mendaftar.'
      loading.value = false
      return
    }
  } catch {
    // Jika check-email gagal, lanjutkan
  }

  const { data, error: e } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: { data: { full_name: fullName.value } },
  })
  loading.value = false

  if (e) {
    formError.value = e.message
    return
  }

  // identities kosong = email sudah ada di database (akun aktif atau belum dikonfirmasi)
  if (data.user?.identities?.length === 0) {
    if (data.user.email_confirmed_at) {
      // Akun sudah aktif — jangan lanjut, tampilkan error
      formError.value = 'Email ini sudah terdaftar dan aktif. Silahkan login, atau hubungi admin jika Anda belum pernah mendaftar sebelumnya.'
      loading.value = false
      return
    }
    // Akun ada tapi belum dikonfirmasi — kirim ulang email
    await supabase.auth.resend({ type: 'signup', email: email.value })
    sentContext.value = 'resent'
  } else {
    sentContext.value = 'new'
  }

  step.value = 'sent'
}
</script>
