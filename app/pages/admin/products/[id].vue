<template>
  <div class="max-w-xl">
    <h1 class="text-2xl font-semibold mb-6">{{ isNew ? 'Tambah Produk' : 'Edit Produk' }}</h1>
    <form class="space-y-3" @submit.prevent="submit">
      <label class="block">
        <span class="block text-sm mb-1">Nama</span>
        <input v-model="form.name" required class="w-full border rounded px-3 py-2" />
      </label>
      <label class="block">
        <span class="block text-sm mb-1">Slug</span>
        <input v-model="form.slug" required class="w-full border rounded px-3 py-2" />
      </label>
      <label class="block">
        <span class="block text-sm mb-1">Deskripsi</span>
        <textarea v-model="form.description" rows="4" class="w-full border rounded px-3 py-2" />
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="block text-sm mb-1">Harga</span>
          <input v-model.number="form.price" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="block">
          <span class="block text-sm mb-1">Stok</span>
          <input v-model.number="form.stock" type="number" min="0" class="w-full border rounded px-3 py-2" />
        </label>
      </div>
      <label class="block">
        <span class="block text-sm mb-1">URL Gambar</span>
        <input v-model="form.image_url" class="w-full border rounded px-3 py-2" />
      </label>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <div class="flex gap-2">
        <button :disabled="saving" class="bg-black text-white px-4 py-2 rounded">{{ saving ? '...' : 'Simpan' }}</button>
        <NuxtLink to="/admin/products" class="px-4 py-2 rounded border">Batal</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = route.params.id as string
const isNew = id === 'new'
const api = useApi()

const form = ref({ name: '', slug: '', description: '', price: 0, stock: 0, image_url: '' })
const error = ref<string | null>(null)
const saving = ref(false)

if (!isNew) {
  const data = await api<Product>(`/api/products/${id}`)
  form.value = {
    name: data.name,
    slug: data.slug,
    description: data.description ?? '',
    price: Number(data.price),
    stock: data.stock,
    image_url: data.image_url ?? '',
  }
}

async function submit() {
  saving.value = true
  error.value = null
  try {
    if (isNew) await api('/api/products', { method: 'POST', body: form.value })
    else await api(`/api/products/${id}`, { method: 'PATCH', body: form.value })
    await navigateTo('/admin/products')
  } catch (e: unknown) {
    error.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal'
  } finally {
    saving.value = false
  }
}
</script>
