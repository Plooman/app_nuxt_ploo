<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-semibold mb-6">Profil Saya</h1>

    <div class="border rounded-lg p-6">
      <div class="mb-4">
        <label class="block text-sm text-gray-500 mb-1">Email</label>
        <div class="text-gray-800">{{ profile?.email }}</div>
      </div>

      <div class="mb-4">
        <label class="block text-sm text-gray-500 mb-1">Role</label>
        <div class="capitalize text-gray-800">{{ profile?.role }}</div>
      </div>

      <hr class="my-4" />

      <form @submit.prevent="save">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="full_name">Nama Lengkap</label>
          <input
            id="full_name"
            v-model="fullName"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <p v-if="errMsg" class="text-red-600 text-sm mb-3">{{ errMsg }}</p>
        <p v-if="successMsg" class="text-green-700 text-sm mb-3">{{ successMsg }}</p>

        <button
          type="submit"
          :disabled="saving"
          class="w-full bg-black text-white py-2 rounded disabled:opacity-50 text-sm"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~~/shared/types'

const api = useApi()
const { profile, refresh } = useAuth()

const fullName = ref(profile.value?.full_name ?? '')
const saving = ref(false)
const errMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

async function save() {
  saving.value = true
  errMsg.value = null
  successMsg.value = null
  try {
    await api<Profile>('/api/auth/me', {
      method: 'PATCH',
      body: { full_name: fullName.value },
    })
    await refresh()
    successMsg.value = 'Profil berhasil diperbarui.'
  } catch (e: unknown) {
    errMsg.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}
</script>
