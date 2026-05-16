<template>
  <div class="min-h-screen flex">
    <aside class="w-60 border-r bg-gray-50 p-4 flex flex-col gap-1">
      <div class="font-semibold mb-4">Ploo Admin</div>
      <NuxtLink to="/admin" class="px-3 py-2 rounded hover:bg-gray-200">Dashboard</NuxtLink>
      <NuxtLink to="/admin/products" class="px-3 py-2 rounded hover:bg-gray-200">Produk</NuxtLink>
      <NuxtLink v-if="isAdmin" to="/admin/news" class="px-3 py-2 rounded hover:bg-gray-200">Berita</NuxtLink>
      <NuxtLink v-if="isAdmin" to="/admin/users" class="px-3 py-2 rounded hover:bg-gray-200">Users</NuxtLink>
      <NuxtLink v-if="isAdmin" to="/admin/orders" class="px-3 py-2 rounded hover:bg-gray-200">Orders</NuxtLink>
      <div class="mt-auto pt-4 border-t text-xs text-gray-600">
        <div>{{ profile?.email }}</div>
        <div class="uppercase">{{ profile?.role }}</div>
        <NuxtLink to="/" class="text-blue-600">← Kembali ke site</NuxtLink>
      </div>
    </aside>
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { profile, isAdmin } = useAuth()
</script>
