<template>
  <div class="max-w-2xl mx-auto">
    <NuxtLink to="/orders" class="text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 inline-block">
      ← Kembali ke pesanan
    </NuxtLink>

    <div v-if="pending" class="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 animate-pulse">
      Memuat...
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Pesanan tidak ditemukan.
    </div>
    <div v-else-if="order">
      <div class="flex items-start justify-between mb-5">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Detail Pesanan</h1>
          <div class="font-mono text-sm text-gray-400 mt-1">#{{ order.id }}</div>
        </div>
        <span :class="statusClass(order.status)" class="text-sm px-3 py-1.5 rounded-full font-medium">
          {{ statusLabel(order.status) }}
        </span>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div
          v-for="item in order.order_items"
          :key="item.id"
          class="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0"
        >
          <div class="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              v-if="item.products?.image_url"
              :src="item.products.image_url"
              :alt="item.products?.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-xl text-gray-200">📦</div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm text-gray-900 line-clamp-1">{{ item.products?.name ?? 'Produk' }}</div>
            <div class="text-xs text-gray-500 mt-0.5">
              {{ item.qty }} × Rp {{ Number(item.price_snapshot).toLocaleString('id-ID') }}
            </div>
          </div>
          <div class="font-semibold text-sm text-gray-900">
            Rp {{ (item.qty * Number(item.price_snapshot)).toLocaleString('id-ID') }}
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4">
        <div class="flex justify-between items-center">
          <div class="text-gray-500 text-sm">Total Pembayaran</div>
          <div class="text-xl font-bold text-gray-900">Rp {{ Number(order.total).toLocaleString('id-ID') }}</div>
        </div>
      </div>

      <div class="text-xs text-gray-400">
        Dipesan pada {{ new Date(order.created_at).toLocaleString('id-ID') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus, OrderWithItems } from '~~/shared/types'

const route = useRoute()
const api = useApi()

const { data: order, pending, error } = await useAsyncData(
  `order-${route.params.id}`,
  () => api<OrderWithItems>(`/api/orders/${route.params.id}`),
)

function statusLabel(s: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: 'Menunggu Pembayaran',
    paid: 'Sudah Dibayar',
    shipped: 'Sedang Dikirim',
    done: 'Selesai',
    cancelled: 'Dibatalkan',
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
