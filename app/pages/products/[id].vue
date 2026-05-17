<template>
  <div>
    <p v-if="error" class="text-red-600">Produk tidak ditemukan.</p>
    <div v-else-if="product" class="grid md:grid-cols-2 gap-8">
      <div class="aspect-square bg-gray-100 rounded overflow-hidden">
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold mb-2">{{ product.name }}</h1>
        <div class="text-xl mb-4">Rp {{ Number(product.price).toLocaleString('id-ID') }}</div>
        <p class="text-gray-700 mb-6 whitespace-pre-line">{{ product.description }}</p>
        <div class="text-sm text-gray-500 mb-4">Stok: {{ product.stock }}</div>

        <div v-if="product.stock > 0" class="flex items-center gap-3 mb-4">
          <div class="flex items-center border rounded">
            <button
              class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              :disabled="qty <= 1"
              @click="qty--"
            >
              -
            </button>
            <span class="w-8 text-center text-sm">{{ qty }}</span>
            <button
              class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              :disabled="qty >= product.stock"
              @click="qty++"
            >
              +
            </button>
          </div>
          <span class="text-sm text-gray-400">maks. {{ product.stock }}</span>
        </div>

        <div v-if="product.stock > 0" class="flex gap-3">
          <button
            class="flex-1 border border-black text-black px-5 py-2 rounded hover:bg-gray-50"
            @click="addToCart"
          >
            + Keranjang
          </button>
          <button
            class="flex-1 bg-black text-white px-5 py-2 rounded hover:bg-gray-800"
            @click="buyNow"
          >
            Beli Sekarang
          </button>
        </div>
        <div v-else class="text-gray-400 text-sm">Stok habis</div>

        <p v-if="msg" class="mt-3 text-sm" :class="msgError ? 'text-red-600' : 'text-green-700'">
          {{ msg }}
          <NuxtLink v-if="!msgError" to="/cart" class="underline ml-1">Lihat keranjang</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const api = useApi()
const cart = useCartStore()
const qty = ref(1)
const msg = ref<string | null>(null)
const msgError = ref(false)

const { data: product, error } = await useAsyncData(
  `product-${route.params.id}`,
  () => api<Product>(`/api/products/${route.params.id}`),
)

function addToCart() {
  if (!product.value) return
  cart.add({
    product_id: product.value.id,
    name: product.value.name,
    price: Number(product.value.price),
    image_url: product.value.image_url,
    stock: product.value.stock,
  }, qty.value)
  msg.value = `${qty.value} item ditambahkan ke keranjang.`
  msgError.value = false
}

async function buyNow() {
  if (!product.value) return
  addToCart()
  await navigateTo('/cart')
}
</script>
