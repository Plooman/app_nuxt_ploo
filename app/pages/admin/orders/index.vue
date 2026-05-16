<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Orders</h1>
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left p-2">ID</th>
          <th class="text-left p-2">User</th>
          <th class="p-2">Status</th>
          <th class="text-right p-2">Total</th>
          <th class="text-left p-2">Dibuat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in items" :key="o.id" class="border-t">
          <td class="p-2 font-mono text-xs">{{ o.id.slice(0, 8) }}</td>
          <td class="p-2 font-mono text-xs">{{ o.user_id.slice(0, 8) }}</td>
          <td class="p-2 text-center">{{ o.status }}</td>
          <td class="p-2 text-right">{{ o.total }}</td>
          <td class="p-2">{{ new Date(o.created_at).toLocaleString() }}</td>
        </tr>
        <tr v-if="!items.length"><td colspan="5" class="p-4 text-center text-gray-500">Belum ada order.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~~/shared/types'
definePageMeta({ layout: 'admin', middleware: 'admin', allowedRoles: ['admin'] })

const api = useApi()
const items = ref<Order[]>([])
onMounted(async () => {
  const res = await api<{ items: Order[] }>('/api/orders')
  items.value = res.items
})
</script>
