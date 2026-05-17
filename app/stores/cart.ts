import { defineStore } from 'pinia'

export interface CartItem {
  product_id: string
  name: string
  price: number
  qty: number
  image_url: string | null
  stock: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem('ploo:cart')
      if (saved) items.value = JSON.parse(saved)
    } catch {}
  }

  function _persist() {
    if (!import.meta.client) return
    localStorage.setItem('ploo:cart', JSON.stringify(items.value))
  }

  function add(product: Omit<CartItem, 'qty'>, qty = 1) {
    const existing = items.value.find((i) => i.product_id === product.product_id)
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, product.stock)
    } else {
      items.value.push({ ...product, qty: Math.min(qty, product.stock) })
    }
    _persist()
  }

  function remove(product_id: string) {
    items.value = items.value.filter((i) => i.product_id !== product_id)
    _persist()
  }

  function updateQty(product_id: string, qty: number) {
    if (qty < 1) { remove(product_id); return }
    const item = items.value.find((i) => i.product_id === product_id)
    if (item) {
      item.qty = Math.min(qty, item.stock)
      _persist()
    }
  }

  function clear() {
    items.value = []
    _persist()
  }

  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.qty, 0))
  const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0))

  return { items, add, remove, updateQty, clear, total, count, loadFromStorage }
})
