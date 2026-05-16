<template>
  <div>
    <p v-if="error" class="text-red-600">Berita tidak ditemukan.</p>
    <article v-else-if="post" class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-semibold mb-2">{{ post.title }}</h1>
      <div class="text-sm text-gray-500 mb-6">
        {{ post.published_at ? new Date(post.published_at).toLocaleDateString() : '' }}
      </div>
      <img v-if="post.cover_url" :src="post.cover_url" :alt="post.title" class="rounded mb-6 w-full" />
      <div class="whitespace-pre-line leading-relaxed">{{ post.content }}</div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { News } from '~~/shared/types'

const route = useRoute()
const api = useApi()

const { data: post, error } = await useAsyncData(
  `news-${route.params.id}`,
  () => api<News>(`/api/news/${route.params.id}`),
)
</script>
