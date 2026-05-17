<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Riwayat Pesanan</h1>
      <p class="text-gray-500 text-sm mt-0.5">Semua pesanan Anda</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white border border-gray-200 rounded-xl p-4 animate-pulse flex justify-between">
        <div class="space-y-2">
          <div class="h-3 bg-gray-200 rounded w-24" />
          <div class="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div class="h-6 bg-gray-200 rounded w-20" />
      </div>
    </div>
    <div v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Gagal memuat pesanan.
    </div>
    <div v-else-if="!items.length" class="text-center py-16 bg-white border border-gray-200 rounded-xl">
      <div class="text-4xl mb-3">📋</div>
      <p class="text-gray-500 font-medium mb-4">Belum ada pesanan</p>
      <NuxtLink
        to="/"
        class="inline-block px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all"
      >
        Mulai Belanja
      </NuxtLink>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="order in items"
        :key="order.id"
        :to="`/orders/${order.id}`"
        class="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div>
          <div class="font-mono text-sm font-semibold text-gray-900 mb-1">#{{ order.id.slice(0, 8) }}</div>
          <div class="text-xs text-gray-400">{{ new Date(order.created_at).toLocaleString('id-ID') }}</div>
        </div>
        <div class="text-right flex flex-col items-end gap-1.5">
          <span :class="statusClass(order.status)" class="text-xs px-2.5 py-1 rounded-full font-medium">
            {{ statusLabel(order.status) }}
          </span>
          <div class="font-bold text-gray-900 text-sm">Rp {{ Number(order.total).toLocaleString('id-ID') }}</div>
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
