<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Floating bar: muncul di semua halaman ketika admin sedang di mode User POV -->
  <Teleport to="body">
    <div
      v-if="isAdmin && viewAs === 'user'"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl text-sm"
    >
      <span class="text-slate-400">👁 Mode User</span>
      <button
        class="px-3 py-1 bg-amber-400 text-amber-900 rounded-lg text-xs font-semibold hover:bg-amber-300 transition-all"
        @click="exitUserPov"
      >
        Kembali ke Admin
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { isAdmin, viewAs, setViewAs } = useAuth()

async function exitUserPov() {
  setViewAs(null)
  await navigateTo('/admin')
}
</script>
