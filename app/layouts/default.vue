<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <NuxtLink to="/" class="font-semibold text-lg">Ploo</NuxtLink>
        <nav class="flex items-center gap-4 text-sm">
          <NuxtLink to="/">Katalog</NuxtLink>
          <NuxtLink to="/news">Berita</NuxtLink>
          <NuxtLink v-if="canManageProducts" to="/admin">Admin</NuxtLink>
          <template v-if="isAuthed">
            <span class="text-gray-500">{{ profile?.email }}</span>
            <button class="text-red-600" @click="logout">Logout</button>
          </template>
          <template v-else>
            <NuxtLink to="/login">Login</NuxtLink>
            <NuxtLink to="/register">Register</NuxtLink>
          </template>
        </nav>
      </div>
    </header>
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAuthed, profile, canManageProducts } = useAuth()
const supabase = useSupabaseClient()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>
