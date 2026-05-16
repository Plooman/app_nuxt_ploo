<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Users</h1>
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left p-2">Email</th>
          <th class="text-left p-2">Nama</th>
          <th class="p-2">Role</th>
          <th class="p-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in items" :key="u.id" class="border-t">
          <td class="p-2">{{ u.email }}</td>
          <td class="p-2">{{ u.full_name }}</td>
          <td class="p-2 text-center">
            <select :value="u.role" class="border rounded px-2 py-1" @change="(e: Event) => changeRole(u.id, (e.target as HTMLSelectElement).value as UserRole)">
              <option value="admin">admin</option>
              <option value="manager">manager</option>
              <option value="user">user</option>
            </select>
          </td>
          <td class="p-2 text-right">
            <button class="text-red-600" @click="remove(u.id)">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Profile, UserRole } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin', allowedRoles: ['admin'] })

const api = useApi()
const items = ref<Profile[]>([])

async function load() {
  const res = await api<{ items: Profile[] }>('/api/users')
  items.value = res.items
}
onMounted(load)

async function changeRole(id: string, role: UserRole) {
  await api(`/api/users/${id}`, { method: 'PATCH', body: { role } })
  await load()
}
async function remove(id: string) {
  if (!confirm('Hapus user ini permanen?')) return
  await api(`/api/users/${id}`, { method: 'DELETE' })
  await load()
}
</script>
