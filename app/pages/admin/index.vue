<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Dashboard</h1>
    <div v-if="loading" class="text-gray-500">Memuat...</div>
    <p v-else-if="loadError" class="text-red-600">Gagal memuat statistik.</p>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="border rounded-lg p-4">
        <div class="text-xs text-gray-500">Produk</div>
        <div class="text-2xl font-semibold">{{ stats?.products ?? '—' }}</div>
      </div>
      <div class="border rounded-lg p-4">
        <div class="text-xs text-gray-500">Berita</div>
        <div class="text-2xl font-semibold">{{ stats?.news ?? '—' }}</div>
      </div>
      <div class="border rounded-lg p-4">
        <div class="text-xs text-gray-500">Users</div>
        <div class="text-2xl font-semibold">{{ stats?.users ?? '—' }}</div>
      </div>
      <div class="border rounded-lg p-4">
        <div class="text-xs text-gray-500">Orders</div>
        <div class="text-2xl font-semibold">{{ stats?.orders ?? '—' }}</div>
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
