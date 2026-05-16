<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Orders</h1>
    <div v-if="loading" class="text-gray-500">Memuat...</div>
    <p v-else-if="loadError" class="text-red-600">Gagal memuat orders.</p>
    <table v-else class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left p-2">ID</th>
          <th class="text-left p-2">User</th>
          <th class="p-2">Status</th>
          <th class="text-right p-2">Total</th>
          <th class="text-left p-2">Dibuat</th>
          <th class="p-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in items" :key="o.id" class="border-t">
          <td class="p-2 font-mono text-xs">{{ o.id.slice(0, 8) }}</td>
          <td class="p-2 font-mono text-xs">{{ o.user_id.slice(0, 8) }}</td>
          <td class="p-2 text-center">
            <select
              :value="o.status"
              class="border rounded px-2 py-1"
              @change="(e: Event) => updateStatus(o.id, (e.target as HTMLSelectElement).value as OrderStatus)"
            >
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="shipped">shipped</option>
              <option value="done">done</option>
              <option value="cancelled">cancelled</option>
            </select>
          </td>
          <td class="p-2 text-right">Rp {{ Number(o.total).toLocaleString('id-ID') }}</td>
          <td class="p-2">{{ new Date(o.created_at).toLocaleString('id-ID') }}</td>
          <td class="p-2 text-xs text-gray-400">
            <span v-if="updating === o.id">menyimpan...</span>
          </td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="6" class="p-4 text-center text-gray-500">Belum ada order.</td>
        </tr>
      </tbody>
    </table>
    <p v-if="updateError" class="text-red-600 text-sm mt-2">{{ updateError }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin', allowedRoles: ['admin'] })

const api = useApi()
const items = ref<Order[]>([])
const loading = ref(true)
const loadError = ref(false)
const updating = ref<string | null>(null)
const updateError = ref<string | null>(null)

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const res = await api<{ items: Order[] }>('/api/orders')
    items.value = res.items
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function updateStatus(id: string, status: OrderStatus) {
  updating.value = id
  updateError.value = null
  try {
    const updated = await api<Order>(`/api/orders/${id}`, { method: 'PATCH', body: { status } })
    const idx = items.value.findIndex((o) => o.id === id)
    if (idx !== -1) items.value[idx] = updated
  } catch (e: unknown) {
    updateError.value = (e as { statusMessage?: string; message?: string }).statusMessage
      ?? (e as { message?: string }).message
      ?? 'Gagal update status'
    await load()
  } finally {
    updating.value = null
  }
}
</script>
