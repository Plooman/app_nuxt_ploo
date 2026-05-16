<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Berita</h1>
    <div v-if="!items.length" class="text-gray-500">Belum ada berita.</div>
    <ul v-else class="space-y-3">
      <li v-for="n in items" :key="n.id" class="border-b pb-3">
        <NuxtLink :to="`/news/${n.id}`" class="text-lg font-medium hover:underline">{{ n.title }}</NuxtLink>
        <div class="text-xs text-gray-500">
          {{ n.published_at ? new Date(n.published_at).toLocaleDateString() : '' }}
        </div>
      </li>
    </ul>
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
