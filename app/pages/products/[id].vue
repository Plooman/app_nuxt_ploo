<template>
  <div>
    <p v-if="error" class="text-red-600">Produk tidak ditemukan.</p>
    <div v-else-if="product" class="grid md:grid-cols-2 gap-8">
      <div class="aspect-square bg-gray-100 rounded overflow-hidden">
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold mb-2">{{ product.name }}</h1>
        <div class="text-xl mb-4">Rp {{ product.price }}</div>
        <p class="text-gray-700 mb-6 whitespace-pre-line">{{ product.description }}</p>
        <div class="text-sm text-gray-500 mb-4">Stok: {{ product.stock }}</div>
        <button
          :disabled="product.stock < 1 || ordering"
          class="bg-black text-white px-5 py-2 rounded disabled:opacity-50"
          @click="buy"
        >
          {{ ordering ? '...' : 'Beli sekarang' }}
        </button>
        <p v-if="msg" class="mt-3 text-sm" :class="msgError ? 'text-red-600' : 'text-green-700'">{{ msg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'

const route = useRoute()
const api = useApi()
const ordering = ref(false)
const msg = ref<string | null>(null)
const msgError = ref(false)

const { data: product, error } = await useAsyncData(
  `product-${route.params.id}`,
  () => api<Product>(`/api/products/${route.params.id}`),
)

async function buy() {
  ordering.value = true
  msg.value = null
  msgError.value = false
  try {
    await api('/api/orders', { method: 'POST', body: { items: [{ product_id: product.value!.id, qty: 1 }] } })
    msg.value = 'Order berhasil dibuat.'
  } catch (e: unknown) {
    msg.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal'
    msgError.value = true
    if ((e as { statusCode?: number }).statusCode === 401) {
      await navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
    }
  } finally {
    ordering.value = false
  }
}
</script>
