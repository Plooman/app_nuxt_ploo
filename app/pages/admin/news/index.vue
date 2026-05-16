<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Berita</h1>
      <NuxtLink to="/admin/news/new" class="bg-black text-white px-3 py-1.5 rounded text-sm">+ Tambah</NuxtLink>
    </div>
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left p-2">Judul</th>
          <th class="text-left p-2">Slug</th>
          <th class="p-2">Status</th>
          <th class="p-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in items" :key="n.id" class="border-t">
          <td class="p-2">{{ n.title }}</td>
          <td class="p-2 text-gray-500">{{ n.slug }}</td>
          <td class="p-2 text-center">
            <span :class="n.published ? 'text-green-700' : 'text-gray-400'">
              {{ n.published ? 'Published' : 'Draft' }}
            </span>
          </td>
          <td class="p-2 text-right">
            <NuxtLink :to="`/admin/news/${n.id}`" class="text-blue-600">Edit</NuxtLink>
            <button class="text-red-600 ml-3" @click="remove(n.id)">Hapus</button>
          </td>
        </tr>
        <tr v-if="!items.length"><td colspan="4" class="p-4 text-center text-gray-500">Belum ada berita.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { News } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin', allowedRoles: ['admin'] })

const api = useApi()
const items = ref<News[]>([])

async function load() {
  const res = await api<{ items: News[] }>('/api/news?all=1')
  items.value = res.items
}
onMounted(load)

async function remove(id: string) {
  if (!confirm('Hapus berita ini?')) return
  await api(`/api/news/${id}`, { method: 'DELETE' })
  await load()
}
</script>
