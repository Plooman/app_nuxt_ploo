<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">Keranjang Belanja</h1>

    <div v-if="!cart.items.length" class="text-center py-16 text-gray-400">
      <p class="text-lg mb-4">Keranjang kosong.</p>
      <NuxtLink to="/" class="text-black underline text-sm">Lihat katalog</NuxtLink>
    </div>

    <div v-else>
      <div class="border rounded-lg overflow-hidden mb-6">
        <div
          v-for="item in cart.items"
          :key="item.product_id"
          class="flex items-center gap-4 p-4 border-b last:border-b-0"
        >
          <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium line-clamp-1">{{ item.name }}</div>
            <div class="text-sm text-gray-500">Rp {{ item.price.toLocaleString('id-ID') }}</div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100"
              @click="cart.updateQty(item.product_id, item.qty - 1)"
            >
              -
            </button>
            <span class="w-8 text-center text-sm">{{ item.qty }}</span>
            <button
              :disabled="item.qty >= item.stock"
              class="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              @click="cart.updateQty(item.product_id, item.qty + 1)"
            >
              +
            </button>
          </div>
          <div class="w-24 text-right text-sm font-medium">
            Rp {{ (item.price * item.qty).toLocaleString('id-ID') }}
          </div>
          <button
            class="text-red-500 text-sm hover:text-red-700 ml-2"
            @click="cart.remove(item.product_id)"
          >
            Hapus
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between mb-6">
        <div class="text-gray-600">
          Total ({{ cart.count }} item)
        </div>
        <div class="text-xl font-semibold">
          Rp {{ cart.total.toLocaleString('id-ID') }}
        </div>
      </div>

      <p v-if="errMsg" class="text-red-600 text-sm mb-4">{{ errMsg }}</p>

      <div class="flex gap-3">
        <NuxtLink to="/" class="border px-4 py-2 rounded text-sm hover:bg-gray-50">
          Lanjut Belanja
        </NuxtLink>
        <button
          :disabled="loading"
          class="flex-1 bg-black text-white py-2 rounded disabled:opacity-50"
          @click="checkout"
        >
          {{ loading ? 'Memproses...' : 'Checkout' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cart = useCartStore()
const api = useApi()
const loading = ref(false)
const errMsg = ref<string | null>(null)

async function checkout() {
  loading.value = true
  errMsg.value = null
  try {
    const result = await api<{ id: string }>('/api/orders', {
      method: 'POST',
      body: {
        items: cart.items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
      },
    })
    cart.clear()
    await navigateTo(`/orders/${result.id}`)
  } catch (e: unknown) {
    const err = e as { statusMessage?: string; message?: string; statusCode?: number }
    errMsg.value = err.statusMessage ?? err.message ?? 'Gagal checkout'
    if (err.statusCode === 401) {
      await navigateTo('/login?redirect=/cart')
    }
  } finally {
    loading.value = false
  }
}
</script>
