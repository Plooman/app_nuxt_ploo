<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Users</h1>
      <p class="text-gray-500 text-sm mt-0.5">Kelola akun pengguna</p>
    </div>

    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 animate-pulse">
      Memuat...
    </div>
    <div v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Gagal memuat users.
    </div>
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div v-if="actionError" class="bg-red-50 border-b border-red-200 text-red-700 px-5 py-3 text-sm">
        {{ actionError }}
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Role</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="u in items" :key="u.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-gray-900">{{ u.email }}</td>
            <td class="px-4 py-3 text-gray-600">{{ u.full_name || '—' }}</td>
            <td class="px-4 py-3 text-center">
              <select
                :value="u.role"
                class="border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                @change="(e: Event) => changeRole(u.id, (e.target as HTMLSelectElement).value as UserRole)"
              >
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="user">user</option>
              </select>
            </td>
            <td class="px-4 py-3 text-right">
              <button class="text-sm text-red-500 font-medium hover:text-red-700 transition-colors" @click="remove(u.id)">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile, UserRole } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin', allowedRoles: ['admin'] })

const api = useApi()
const items = ref<Profile[]>([])
const loading = ref(true)
const loadError = ref(false)
const actionError = ref<string | null>(null)

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const res = await api<{ items: Profile[] }>('/api/users')
    items.value = res.items
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function changeRole(id: string, role: UserRole) {
  actionError.value = null
  try {
    await api(`/api/users/${id}`, { method: 'PATCH', body: { role } })
    await load()
  } catch (e: unknown) {
    actionError.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal mengubah role'
  }
}
async function remove(id: string) {
  if (!confirm('Hapus user ini permanen?')) return
  actionError.value = null
  try {
    await api(`/api/users/${id}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    actionError.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal menghapus user'
  }
}
</script>
