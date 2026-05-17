<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Berita</h1>
      <p class="text-gray-500 text-sm mt-1">Update terbaru dari Ploo</p>
    </div>
    <div v-if="!items.length" class="text-center py-16 text-gray-400">
      <div class="text-4xl mb-3">📰</div>
      <div class="font-medium">Belum ada berita</div>
    </div>
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="n in items"
        :key="n.id"
        :to="`/news/${n.id}`"
        class="group block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div class="font-semibold text-gray-900 group-hover:text-slate-700 transition-colors">{{ n.title }}</div>
        <div class="text-xs text-gray-400 mt-1">
          {{ n.published_at ? new Date(n.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '' }}
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { News } from '~~/shared/types'

const api = useApi()
const items = ref<News[]>([])
onMounted(async () => {
  const res = await api<{ items: News[] }>('/api/news')
  items.value = res.items
})
</script>
