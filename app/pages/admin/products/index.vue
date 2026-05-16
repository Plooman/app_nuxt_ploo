<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Produk</h1>
      <NuxtLink to="/admin/products/new" class="bg-black text-white px-3 py-1.5 rounded text-sm">+ Tambah</NuxtLink>
    </div>
    <input v-model="q" placeholder="Cari nama..." class="border rounded px-3 py-2 mb-3 w-full max-w-xs" />
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left p-2">Nama</th>
          <th class="text-left p-2">Slug</th>
          <th class="text-right p-2">Harga</th>
          <th class="text-right p-2">Stok</th>
          <th class="p-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in items" :key="p.id" class="border-t">
          <td class="p-2">{{ p.name }}</td>
          <td class="p-2 text-gray-500">{{ p.slug }}</td>
          <td class="p-2 text-right">{{ p.price }}</td>
          <td class="p-2 text-right">{{ p.stock }}</td>
          <td class="p-2 text-right">
            <NuxtLink :to="`/admin/products/${p.id}`" class="text-blue-600">Edit</NuxtLink>
            <button class="text-red-600 ml-3" @click="remove(p.id)">Hapus</button>
          </td>
        </tr>
        <tr v-if="!items.length"><td colspan="5" class="p-4 text-center text-gray-500">Tidak ada produk.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const items = ref<Product[]>([])
const q = ref('')

async function load() {
  const res = await api<{ items: Product[] }>(`/api/products?q=${encodeURIComponent(q.value)}`)
  items.value = res.items
}
watch(q, load)
onMounted(load)

async function remove(id: string) {
  if (!confirm('Hapus produk ini?')) return
  await api(`/api/products/${id}`, { method: 'DELETE' })
  await load()
}
</script>
