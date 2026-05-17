<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Katalog Produk</h1>
      <p class="text-gray-500 text-sm mt-1">Temukan produk pilihan terbaik untuk Anda</p>
    </div>
    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="border border-gray-200 rounded-xl p-3 animate-pulse">
        <div class="aspect-square bg-gray-200 rounded-lg mb-3" />
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div class="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div v-else-if="fetchError" class="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
      <div class="font-medium text-red-700">Gagal memuat produk</div>
      <div class="text-sm mt-1 font-mono text-red-500">{{ fetchError }}</div>
    </div>
    <div v-else-if="!items.length" class="text-center py-16 text-gray-400">
      <div class="text-4xl mb-3">📦</div>
      <div class="font-medium">Belum ada produk tersedia</div>
    </div>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <NuxtLink
        v-for="p in items"
        :key="p.id"
        :to="`/products/${p.id}`"
        class="group border border-gray-200 bg-white rounded-xl p-3 hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div class="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
          <img
            v-if="p.image_url"
            :src="p.image_url"
            :alt="p.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
        </div>
        <div class="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">{{ p.name }}</div>
        <div class="text-sm font-medium text-slate-700">Rp {{ Number(p.price).toLocaleString('id-ID') }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'

const api = useApi()
const items = ref<Product[]>([])
const pending = ref(true)
const fetchError = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await api<{ items: Product[] }>('/api/products')
    items.value = res.items
  } catch (e: unknown) {
    const err = e as { statusMessage?: string; data?: { message?: string }; message?: string }
    fetchError.value = err.statusMessage ?? err.data?.message ?? err.message ?? 'Unknown error'
  } finally {
    pending.value = false
  }
})
</script>
