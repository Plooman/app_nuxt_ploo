<template>
  <div class="max-w-sm mx-auto py-12">
    <h1 class="text-2xl font-semibold mb-6">Login</h1>
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm mb-1">Email</label>
        <input v-model="email" type="email" required class="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm mb-1">Password</label>
        <input v-model="password" type="password" required class="w-full border rounded px-3 py-2" />
      </div>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <button :disabled="loading" class="w-full bg-black text-white py-2 rounded">
        {{ loading ? 'Loading...' : 'Login' }}
      </button>
    </form>
    <p class="text-sm mt-4">
      Belum punya akun? <NuxtLink to="/register" class="text-blue-600">Register</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
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
