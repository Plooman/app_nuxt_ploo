<template>
  <div class="max-w-sm mx-auto py-12 text-center">
    <p>Memproses login...</p>
  </div>
</template>

<script setup lang="ts">
const { refresh } = useAuth()
onMounted(async () => {
  await refresh()
  await navigateTo('/')
})
</script>
