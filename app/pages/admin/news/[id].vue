<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold mb-6">{{ isNew ? 'Tambah Berita' : 'Edit Berita' }}</h1>
    <form class="space-y-3" @submit.prevent="submit">
      <label class="block">
        <span class="block text-sm mb-1">Judul</span>
        <input v-model="form.title" required class="w-full border rounded px-3 py-2" />
      </label>
      <label class="block">
        <span class="block text-sm mb-1">Slug</span>
        <input v-model="form.slug" required class="w-full border rounded px-3 py-2" />
      </label>
      <label class="block">
        <span class="block text-sm mb-1">Cover URL</span>
        <input v-model="form.cover_url" class="w-full border rounded px-3 py-2" />
      </label>
      <label class="block">
        <span class="block text-sm mb-1">Konten</span>
        <textarea v-model="form.content" rows="10" class="w-full border rounded px-3 py-2" />
      </label>
      <label class="flex items-center gap-2">
        <input v-model="form.published" type="checkbox" />
        <span>Publish</span>
      </label>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <div class="flex gap-2">
        <button :disabled="saving" class="bg-black text-white px-4 py-2 rounded">{{ saving ? '...' : 'Simpan' }}</button>
        <NuxtLink to="/admin/news" class="px-4 py-2 rounded border">Batal</NuxtLink>
      </div>
    </form>
  </div>
</template>

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
  const data = await api<News>(`/api/news/${id}`)
  form.value = {
    title: data.title,
    slug: data.slug,
    content: data.content ?? '',
    cover_url: data.cover_url ?? '',
    published: data.published,
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
      ?? 'Gagal'
  } finally {
    saving.value = false
  }
}
</script>
