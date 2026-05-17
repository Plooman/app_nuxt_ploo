<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <NuxtLink to="/" class="font-black text-xl text-slate-900 tracking-tight hover:text-slate-600 transition-colors">
          Ploo
        </NuxtLink>
        <nav class="flex items-center gap-1 text-sm">
          <NuxtLink
            to="/"
            class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
            active-class="bg-gray-100 text-gray-900 font-medium"
          >
            Katalog
          </NuxtLink>
          <NuxtLink
            to="/news"
            class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
            active-class="bg-gray-100 text-gray-900 font-medium"
          >
            Berita
          </NuxtLink>
          <NuxtLink
            v-if="canManageProducts"
            to="/admin"
            class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            Admin
          </NuxtLink>
          <template v-if="isAuthed">
            <div class="w-px h-4 bg-gray-200 mx-1" />
            <NuxtLink
              to="/cart"
              class="relative px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              active-class="bg-gray-100 text-gray-900 font-medium"
            >
              Keranjang
              <span
                v-if="cartCount > 0"
                class="absolute -top-1 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none"
              >
                {{ cartCount > 9 ? '9+' : cartCount }}
              </span>
            </NuxtLink>
            <NuxtLink
              to="/orders"
              class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              active-class="bg-gray-100 text-gray-900 font-medium"
            >
              Pesanan
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all max-w-[140px] truncate"
              active-class="bg-gray-100 text-gray-900 font-medium"
            >
              {{ profile?.full_name || profile?.email }}
            </NuxtLink>
            <button
              class="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
              @click="logout"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <div class="w-px h-4 bg-gray-200 mx-1" />
            <NuxtLink
              to="/login"
              class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              Login
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="px-4 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-all font-medium"
            >
              Register
            </NuxtLink>
          </template>
        </nav>
      </div>
    </header>
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <slot />
    </main>
    <footer class="border-t border-gray-200 bg-white mt-auto">
      <div class="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-400 text-center">
        © {{ new Date().getFullYear() }} Ploo. All rights reserved.
      </div>
    </footer>
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
