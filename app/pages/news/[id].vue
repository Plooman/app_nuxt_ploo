<template>
  <div>
    <NuxtLink to="/news" class="text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 inline-block">
      ← Kembali ke Berita
    </NuxtLink>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Berita tidak ditemukan.
    </div>
    <article v-else-if="post" class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ post.title }}</h1>
      <div class="text-sm text-gray-400 mb-6">
        {{ post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '' }}
      </div>
      <img
        v-if="post.cover_url"
        :src="post.cover_url"
        :alt="post.title"
        class="rounded-2xl mb-6 w-full object-cover max-h-80"
      />
      <div class="text-gray-700 whitespace-pre-line leading-relaxed text-sm">{{ post.content }}</div>
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
