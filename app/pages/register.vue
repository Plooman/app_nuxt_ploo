<template>
  <div class="max-w-sm mx-auto py-12">
    <h1 class="text-2xl font-semibold mb-6">Register</h1>
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm mb-1">Nama lengkap</label>
        <input v-model="fullName" required class="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm mb-1">Email</label>
        <input v-model="email" type="email" required class="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm mb-1">Password</label>
        <input v-model="password" type="password" required minlength="6" class="w-full border rounded px-3 py-2" />
      </div>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <p v-if="info" class="text-green-700 text-sm">{{ info }}</p>
      <button :disabled="loading" class="w-full bg-black text-white py-2 rounded">
        {{ loading ? 'Loading...' : 'Register' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const fullName = ref('')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const info = ref<string | null>(null)
const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = null
  info.value = null
  const { error: e } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: { data: { full_name: fullName.value } },
  })
  loading.value = false
  if (e) {
    error.value = e.message
    return
  }
  info.value = 'Akun dibuat. Cek email untuk verifikasi (jika diaktifkan), lalu login.'
}
</script>
