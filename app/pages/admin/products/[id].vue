<template>
  <div class="max-w-xl">
    <div class="mb-6">
      <NuxtLink to="/admin/products" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
        ← Kembali ke Produk
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-3">{{ isNew ? 'Tambah Produk' : 'Edit Produk' }}</h1>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6">
      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
          <input v-model="form.name" required class="input-field" placeholder="Nama produk" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
          <input v-model="form.slug" required class="input-field" placeholder="nama-produk" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <textarea v-model="form.description" rows="4" class="input-field resize-none" placeholder="Deskripsi produk..." />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp)</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" class="input-field" placeholder="0" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Stok</label>
            <input v-model.number="form.stock" type="number" min="0" class="input-field" placeholder="0" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">URL Gambar</label>
          <input v-model="form.image_url" class="input-field" placeholder="https://..." />
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {{ error }}
        </div>

        <div class="flex gap-3 pt-2">
          <button :disabled="saving" class="btn-primary">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
          <NuxtLink to="/admin/products" class="btn-secondary">Batal</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
.input-field {
  @apply w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all;
}
.btn-primary {
  @apply px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all;
}
</style>

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
  try {
    const data = await api<Product>(`/api/products/${id}`)
    form.value = {
      name: data.name,
      slug: data.slug,
      description: data.description ?? '',
      price: Number(data.price),
      stock: data.stock,
      image_url: data.image_url ?? '',
    }
  } catch {
    await navigateTo('/admin/products')
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
      ?? 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}
</script>
