<template>
  <div class="max-w-2xl mx-auto">
    <NuxtLink to="/orders" class="text-sm text-gray-500 hover:text-black mb-4 inline-block">
      ← Kembali ke pesanan
    </NuxtLink>

    <div v-if="pending" class="text-gray-500">Memuat...</div>
    <div v-else-if="error" class="text-red-600">Pesanan tidak ditemukan.</div>
    <div v-else-if="order">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-xl font-semibold">Pesanan</h1>
          <div class="font-mono text-sm text-gray-500 mt-1">#{{ order.id }}</div>
        </div>
        <span :class="statusClass(order.status)" class="text-sm px-3 py-1 rounded-full font-medium">
          {{ statusLabel(order.status) }}
        </span>
      </div>

      <div class="border rounded-lg overflow-hidden mb-6">
        <div
          v-for="item in order.order_items"
          :key="item.id"
          class="flex items-center gap-4 p-4 border-b last:border-b-0"
        >
          <div class="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <img
              v-if="item.products?.image_url"
              :src="item.products.image_url"
              :alt="item.products?.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium line-clamp-1">{{ item.products?.name ?? 'Produk' }}</div>
            <div class="text-sm text-gray-500">{{ item.qty }} × Rp {{ Number(item.price_snapshot).toLocaleString('id-ID') }}</div>
          </div>
          <div class="font-medium text-sm">
            Rp {{ (item.qty * Number(item.price_snapshot)).toLocaleString('id-ID') }}
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center border-t pt-4">
        <div class="text-gray-600">Total</div>
        <div class="text-xl font-semibold">Rp {{ Number(order.total).toLocaleString('id-ID') }}</div>
      </div>

      <div class="text-sm text-gray-400 mt-3">
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
