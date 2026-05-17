<template>
  <div class="min-h-screen flex bg-gray-50">
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div class="px-6 py-5 border-b border-slate-700">
        <div class="font-black text-xl tracking-tight">Ploo</div>
        <div class="text-slate-400 text-xs mt-0.5">Admin Panel</div>
      </div>
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
          active-class="bg-slate-700 text-white font-medium"
          exact
        >
          <span class="text-base">📊</span>
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/admin/products"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
          active-class="bg-slate-700 text-white font-medium"
        >
          <span class="text-base">📦</span>
          Produk
        </NuxtLink>
        <NuxtLink
          v-if="effectiveIsAdmin"
          to="/admin/news"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
          active-class="bg-slate-700 text-white font-medium"
        >
          <span class="text-base">📰</span>
          Berita
        </NuxtLink>
        <NuxtLink
          v-if="effectiveIsAdmin"
          to="/admin/users"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
          active-class="bg-slate-700 text-white font-medium"
        >
          <span class="text-base">👥</span>
          Users
        </NuxtLink>
        <NuxtLink
          v-if="effectiveIsAdmin"
          to="/admin/orders"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
          active-class="bg-slate-700 text-white font-medium"
        >
          <span class="text-base">🛒</span>
          Orders
        </NuxtLink>
      </nav>

      <!-- POV Switcher — hanya muncul untuk admin asli -->
      <div v-if="isAdmin" class="px-4 py-3 border-t border-slate-700">
        <div class="text-xs text-slate-500 mb-2 uppercase tracking-wide">Lihat sebagai</div>
        <div class="flex gap-1">
          <button
            v-for="r in POV_ROLES"
            :key="r.value"
            :title="r.label"
            :class="effectiveRole === r.value
              ? 'bg-slate-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'"
            class="flex-1 text-xs py-1.5 rounded-lg transition-all font-medium"
            @click="switchPov(r.value)"
          >
            {{ r.label }}
          </button>
        </div>
      </div>

      <div class="px-4 py-4 border-t border-slate-700">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold uppercase">
            {{ (profile?.full_name || profile?.email || '?')[0] }}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-white truncate">{{ profile?.full_name || profile?.email }}</div>
            <div class="text-xs text-slate-400 uppercase">
              {{ profile?.role }}
              <span v-if="viewAs" class="text-amber-400 ml-1">(melihat sbg {{ viewAs }})</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <NuxtLink
            to="/"
            class="flex-1 text-center px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-xs"
          >
            ← Site
          </NuxtLink>
          <button
            class="flex-1 text-center px-3 py-1.5 rounded-lg bg-red-900/50 text-red-400 hover:bg-red-900 hover:text-red-300 transition-all text-xs"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
    <main class="flex-1 overflow-auto">
      <!-- Banner POV aktif -->
      <div
        v-if="isAdmin && viewAs"
        class="bg-amber-400 text-amber-900 px-6 py-2 flex items-center justify-between text-xs font-medium"
      >
        <span>👁 Mode pratinjau: melihat panel sebagai <strong class="uppercase">{{ viewAs }}</strong></span>
        <button class="underline hover:no-underline" @click="switchPov('admin')">
          Kembali ke tampilan Admin
        </button>
      </div>
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~~/shared/types'

const { profile, isAdmin, effectiveIsAdmin, effectiveRole, viewAs, setViewAs } = useAuth()
const supabase = useSupabaseClient()

const POV_ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
]

async function switchPov(r: UserRole) {
  // Klik role yang sama = reset ke admin view
  setViewAs(r === 'admin' ? null : r)
  if (r === 'user') {
    // User tidak bisa akses panel admin — arahkan ke site publik
    await navigateTo('/')
  } else {
    // Refresh halaman saat ini agar middleware re-evaluasi
    await navigateTo(useRoute().fullPath)
  }
}

async function logout() {
  setViewAs(null)
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>
