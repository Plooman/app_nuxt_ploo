<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Katalog</h1>
    <div v-if="pending">Loading...</div>
    <div v-else-if="fetchError" class="text-red-600">
      <div class="font-medium">Gagal memuat produk.</div>
      <div class="text-sm mt-1 font-mono bg-red-50 px-2 py-1 rounded">{{ fetchError }}</div>
    </div>
    <div v-else-if="!items.length" class="text-gray-500">Belum ada produk.</div>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <NuxtLink
        v-for="p in items"
        :key="p.id"
        :to="`/products/${p.id}`"
        class="border rounded-lg p-3 hover:shadow"
      >
        <div v-if="p.image_url" class="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
          <img :src="p.image_url" :alt="p.name" class="w-full h-full object-cover" />
        </div>
        <div class="font-medium line-clamp-1">{{ p.name }}</div>
        <div class="text-sm text-gray-600">Rp {{ p.price }}</div>
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
