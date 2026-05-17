<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Berita</h1>
        <p class="text-gray-500 text-sm mt-0.5">Kelola semua artikel berita</p>
      </div>
      <NuxtLink to="/admin/news/new" class="btn-primary">+ Tambah Berita</NuxtLink>
    </div>

    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 animate-pulse">
      Memuat...
    </div>
    <div v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Gagal memuat berita.
    </div>
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div v-if="actionError" class="bg-red-50 border-b border-red-200 text-red-700 px-5 py-3 text-sm">
        {{ actionError }}
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Judul</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Status</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="!items.length">
            <td colspan="4" class="px-4 py-10 text-center text-gray-400">Belum ada berita.</td>
          </tr>
          <tr v-for="n in items" :key="n.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-900">{{ n.title }}</td>
            <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ n.slug }}</td>
            <td class="px-4 py-3 text-center">
              <span
                :class="n.published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'"
                class="text-xs px-2.5 py-1 rounded-full font-medium"
              >
                {{ n.published ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink :to="`/admin/news/${n.id}`" class="text-sm text-slate-700 font-medium hover:text-slate-900 transition-colors">
                  Edit
                </NuxtLink>
                <button class="text-sm text-red-500 font-medium hover:text-red-700 transition-colors" @click="remove(n.id)">
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
.btn-primary {
  @apply px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all;
}
</style>

<script setup lang="ts">
import type { News } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin', allowedRoles: ['admin'] })

const api = useApi()
const items = ref<News[]>([])
const loading = ref(true)
const loadError = ref(false)
const actionError = ref<string | null>(null)

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const res = await api<{ items: News[] }>('/api/news?all=1')
    items.value = res.items
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function remove(id: string) {
  if (!confirm('Hapus berita ini?')) return
  actionError.value = null
  try {
    await api(`/api/news/${id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    actionError.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal menghapus berita'
  }
}
</script>
