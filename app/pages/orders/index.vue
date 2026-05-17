<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Riwayat Pesanan</h1>

    <div v-if="loading" class="text-gray-500">Memuat...</div>
    <p v-else-if="loadError" class="text-red-600">Gagal memuat pesanan.</p>
    <div v-else-if="!items.length" class="text-center py-16 text-gray-400">
      <p class="mb-4">Belum ada pesanan.</p>
      <NuxtLink to="/" class="text-black underline text-sm">Mulai belanja</NuxtLink>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="order in items"
        :key="order.id"
        :to="`/orders/${order.id}`"
        class="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50"
      >
        <div>
          <div class="font-mono text-sm text-gray-500 mb-1">#{{ order.id.slice(0, 8) }}</div>
          <div class="text-sm text-gray-400">{{ new Date(order.created_at).toLocaleString('id-ID') }}</div>
        </div>
        <div class="text-right">
          <span :class="statusClass(order.status)" class="text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block">
            {{ statusLabel(order.status) }}
          </span>
          <div class="font-semibold">Rp {{ Number(order.total).toLocaleString('id-ID') }}</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus } from '~~/shared/types'

const api = useApi()
const items = ref<Order[]>([])
const loading = ref(true)
const loadError = ref(false)

onMounted(async () => {
  try {
    const res = await api<{ items: Order[] }>('/api/orders')
    items.value = res.items
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})

function statusLabel(s: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: 'Menunggu', paid: 'Dibayar', shipped: 'Dikirim', done: 'Selesai', cancelled: 'Dibatalkan',
  }
  return map[s] ?? s
}

function statusClass(s: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    done: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return map[s] ?? 'bg-gray-100 text-gray-800'
}
</script>
