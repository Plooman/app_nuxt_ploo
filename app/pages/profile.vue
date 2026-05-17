<template>
  <div class="max-w-md mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Profil Saya</h1>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-6 py-5 bg-slate-50 border-b border-gray-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white text-lg font-bold uppercase">
          {{ (profile?.full_name || profile?.email || '?')[0] }}
        </div>
        <div>
          <div class="font-semibold text-gray-900">{{ profile?.full_name || 'Belum diisi' }}</div>
          <div class="text-sm text-gray-500">{{ profile?.email }}</div>
        </div>
      </div>

      <div class="px-6 py-5">
        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="bg-gray-50 rounded-xl px-4 py-3">
            <div class="text-xs text-gray-500 mb-1">Email</div>
            <div class="text-sm font-medium text-gray-900 truncate">{{ profile?.email }}</div>
          </div>
          <div class="bg-gray-50 rounded-xl px-4 py-3">
            <div class="text-xs text-gray-500 mb-1">Role</div>
            <div class="text-sm font-medium text-gray-900 capitalize">{{ profile?.role }}</div>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-5">
          <div class="text-sm font-semibold text-gray-700 mb-4">Edit Profil</div>
          <form @submit.prevent="save">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="full_name">Nama Lengkap</label>
              <input
                id="full_name"
                v-model="fullName"
                type="text"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div
              v-if="errMsg"
              class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4"
            >
              {{ errMsg }}
            </div>
            <div
              v-if="successMsg"
              class="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4"
            >
              {{ successMsg }}
            </div>

            <button
              type="submit"
              :disabled="saving"
              class="w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-700 transition-all disabled:opacity-50 text-sm"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </form>
        </div>
      </div>
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
