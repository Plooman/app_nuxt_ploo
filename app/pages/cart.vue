<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
    </div>

    <div v-if="!cart.items.length" class="text-center py-16 bg-white border border-gray-200 rounded-xl">
      <div class="text-5xl mb-4">🛒</div>
      <p class="text-gray-500 font-medium mb-4">Keranjang Anda masih kosong</p>
      <NuxtLink
        to="/"
        class="inline-block px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all"
      >
        Lihat Katalog
      </NuxtLink>
    </div>

    <div v-else>
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div
          v-for="item in cart.items"
          :key="item.product_id"
          class="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
        >
          <div class="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-xl text-gray-300">📦</div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm text-gray-900 line-clamp-1">{{ item.name }}</div>
            <div class="text-sm text-gray-500">Rp {{ item.price.toLocaleString('id-ID') }}</div>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 font-medium"
              @click="cart.updateQty(item.product_id, item.qty - 1)"
            >
              −
            </button>
            <span class="w-8 text-center text-sm font-medium text-gray-900">{{ item.qty }}</span>
            <button
              :disabled="item.qty >= item.stock"
              class="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 font-medium disabled:opacity-40"
              @click="cart.updateQty(item.product_id, item.qty + 1)"
            >
              +
            </button>
          </div>
          <div class="w-24 text-right text-sm font-semibold text-gray-900">
            Rp {{ (item.price * item.qty).toLocaleString('id-ID') }}
          </div>
          <button
            class="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-1"
            title="Hapus"
            @click="cart.remove(item.product_id)"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-5">
        <div class="flex items-center justify-between">
          <div class="text-gray-600 text-sm">Total ({{ cart.count }} item)</div>
          <div class="text-xl font-bold text-gray-900">Rp {{ cart.total.toLocaleString('id-ID') }}</div>
        </div>
      </div>

      <div
        v-if="errMsg"
        class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4"
      >
        {{ errMsg }}
      </div>

      <div class="flex gap-3">
        <NuxtLink
          to="/"
          class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          Lanjut Belanja
        </NuxtLink>
        <button
          :disabled="loading"
          class="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 transition-all disabled:opacity-50"
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
