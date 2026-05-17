<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
      <p class="text-gray-500 text-sm mt-0.5">Kelola semua pesanan</p>
    </div>

    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 animate-pulse">
      Memuat...
    </div>
    <div v-else-if="loadError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
      Gagal memuat orders.
    </div>
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div v-if="updateError" class="bg-red-50 border-b border-red-200 text-red-700 px-5 py-3 text-sm">
        {{ updateError }}
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Status</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dibuat</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="!items.length">
            <td colspan="6" class="px-4 py-10 text-center text-gray-400">Belum ada order.</td>
          </tr>
          <tr v-for="o in items" :key="o.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ o.id.slice(0, 8) }}…</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ o.user_id.slice(0, 8) }}…</td>
            <td class="px-4 py-3 text-center">
              <select
                :value="o.status"
                class="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                @change="(e: Event) => updateStatus(o.id, (e.target as HTMLSelectElement).value as OrderStatus)"
              >
                <option value="pending">Menunggu</option>
                <option value="paid">Dibayar</option>
                <option value="shipped">Dikirim</option>
                <option value="done">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </td>
            <td class="px-4 py-3 text-right font-medium text-gray-900">Rp {{ Number(o.total).toLocaleString('id-ID') }}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(o.created_at).toLocaleString('id-ID') }}</td>
            <td class="px-4 py-3 text-xs text-gray-400 text-center">
              <span v-if="updating === o.id" class="text-slate-500">menyimpan...</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
