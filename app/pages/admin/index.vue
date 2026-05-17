<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Ringkasan statistik aplikasi</p>
    </div>
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div class="h-8 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
    <p v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Gagal memuat statistik.
    </p>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">📦</span>
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Produk</div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats?.products ?? '—' }}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">📰</span>
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Berita</div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats?.news ?? '—' }}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">👥</span>
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Users</div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats?.users ?? '—' }}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">🛒</span>
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Orders</div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats?.orders ?? '—' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const stats = ref<{ products: number; news: number; users: number; orders: number } | null>(null)
const loading = ref(true)
const loadError = ref(false)

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const [p, n, u, o] = await Promise.all([
      api<{ total: number }>('/api/products?limit=1'),
      api<{ total: number }>('/api/news?limit=1&all=1').catch(() => ({ total: 0 })),
      api<{ total: number }>('/api/users?limit=1').catch(() => ({ total: 0 })),
      api<{ total: number }>('/api/orders').catch(() => ({ total: 0 })),
    ])
    stats.value = { products: p.total, news: n.total, users: u.total, orders: o.total }
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
