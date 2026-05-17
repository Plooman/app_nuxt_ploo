import { useCartStore } from '~/stores/cart'

export default defineNuxtPlugin(() => {
  const cart = useCartStore()
  cart.loadFromStorage()
})
