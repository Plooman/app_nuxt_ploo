<template>
  <div>
    <p v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Produk tidak ditemukan.
    </p>
    <div v-else-if="product" class="grid md:grid-cols-2 gap-8">
      <div class="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        <img
          v-if="product.image_url"
          :src="product.image_url"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-6xl text-gray-200">📦</div>
      </div>
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
        <div class="text-2xl font-bold text-slate-900 mb-4">
          Rp {{ Number(product.price).toLocaleString('id-ID') }}
        </div>
        <p class="text-gray-600 mb-5 whitespace-pre-line leading-relaxed text-sm">{{ product.description }}</p>
        <div class="flex items-center gap-2 mb-5">
          <span
            :class="product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            class="text-xs px-2.5 py-1 rounded-full font-medium"
          >
            {{ product.stock > 0 ? `Stok: ${product.stock}` : 'Stok habis' }}
          </span>
        </div>

        <div v-if="product.stock > 0">
          <div class="flex items-center gap-3 mb-5">
            <div class="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button
                class="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 font-medium"
                :disabled="qty <= 1"
                @click="qty--"
              >
                −
              </button>
              <span class="w-10 text-center text-sm font-semibold text-gray-900">{{ qty }}</span>
              <button
                class="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 font-medium"
                :disabled="qty >= product.stock"
                @click="qty++"
              >
                +
              </button>
            </div>
            <span class="text-xs text-gray-400">maks. {{ product.stock }}</span>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 border border-slate-900 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
              @click="addToCart"
            >
              + Keranjang
            </button>
            <button
              class="flex-1 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-all"
              @click="buyNow"
            >
              Beli Sekarang
            </button>
          </div>
        </div>

        <div
          v-if="msg"
          class="mt-4 text-sm px-4 py-3 rounded-xl"
          :class="msgError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'"
        >
          {{ msg }}
          <NuxtLink v-if="!msgError" to="/cart" class="underline font-medium ml-1">Lihat keranjang →</NuxtLink>
        </div>
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
