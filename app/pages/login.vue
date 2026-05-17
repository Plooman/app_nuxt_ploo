<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-1">Selamat datang kembali</h2>
    <p class="text-gray-500 text-sm mb-6">Masuk ke akun Anda untuk melanjutkan</p>
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="nama@email.com"
          class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <input
          v-model="password"
          type="password"
          required
          placeholder="••••••••"
          class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
        />
      </div>
      <div
        v-if="error"
        class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
      >
        <span>⚠️</span>
        {{ error }}
      </div>
      <button
        :disabled="loading"
        class="w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 active:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>
    <p class="text-sm mt-5 text-center text-gray-600">
      Belum punya akun?
      <NuxtLink to="/register" class="text-slate-900 font-semibold hover:underline">Daftar sekarang</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const route = useRoute()
const { refresh } = useAuth()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = null
  const { error: e } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  loading.value = false
  if (e) {
    error.value = e.message
    return
  }
  await refresh()
  const redirect = (route.query.redirect as string) || '/'
  await navigateTo(redirect)
}
</script>
