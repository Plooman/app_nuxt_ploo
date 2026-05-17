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
            <NuxtLink to="/cart" class="relative">
              Keranjang
              <span
                v-if="cartCount > 0"
                class="absolute -top-2 -right-3 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none"
              >
                {{ cartCount > 9 ? '9+' : cartCount }}
              </span>
            </NuxtLink>
            <NuxtLink to="/orders">Pesanan</NuxtLink>
            <NuxtLink to="/profile" class="text-gray-600">{{ profile?.full_name || profile?.email }}</NuxtLink>
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
import { useCartStore } from '~/stores/cart'

const { isAuthed, profile, canManageProducts } = useAuth()
const supabase = useSupabaseClient()
const cart = useCartStore()
const cartCount = computed(() => cart.count)

async function logout() {
  await supabase.auth.signOut()
  cart.clear()
  await navigateTo('/login')
}
</script>
