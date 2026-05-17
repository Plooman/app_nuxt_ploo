<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <NuxtLink to="/admin/news" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
        ← Kembali ke Berita
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 mt-3">{{ isNew ? 'Tambah Berita' : 'Edit Berita' }}</h1>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6">
      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Judul</label>
          <input v-model="form.title" required class="input-field" placeholder="Judul berita" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
          <input v-model="form.slug" required class="input-field" placeholder="judul-berita" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Cover URL</label>
          <input v-model="form.cover_url" class="input-field" placeholder="https://..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Konten</label>
          <textarea v-model="form.content" rows="10" class="input-field resize-none" placeholder="Tulis konten berita..." />
        </div>
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <div class="relative">
            <input v-model="form.published" type="checkbox" class="sr-only peer" />
            <div class="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-slate-900 transition-colors" />
            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span class="text-sm font-medium text-gray-700">Publish</span>
        </label>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {{ error }}
        </div>

        <div class="flex gap-3 pt-2">
          <button :disabled="saving" class="btn-primary">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
          <NuxtLink to="/admin/news" class="btn-secondary">Batal</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
import type { News } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin', allowedRoles: ['admin'] })

const route = useRoute()
const id = route.params.id as string
const isNew = id === 'new'
const api = useApi()

const form = ref({ title: '', slug: '', content: '', cover_url: '', published: false })
const error = ref<string | null>(null)
const saving = ref(false)

if (!isNew) {
  try {
    const data = await api<News>(`/api/news/${id}`)
    form.value = {
      title: data.title,
      slug: data.slug,
      content: data.content ?? '',
      cover_url: data.cover_url ?? '',
      published: data.published,
    }
  } catch {
    await navigateTo('/admin/news')
  }
}

async function submit() {
  saving.value = true
  error.value = null
  try {
    if (isNew) await api('/api/news', { method: 'POST', body: form.value })
    else await api(`/api/news/${id}`, { method: 'PATCH', body: form.value })
    await navigateTo('/admin/news')
  } catch (e: unknown) {
    error.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}
</script>
