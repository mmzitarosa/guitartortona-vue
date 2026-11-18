import { computed, ref } from 'vue'

export interface CartItem {
  productId: number
  internalCode?: string
  brand?: string
  description?: string
  quantity: number
  salePrice: number
  vat: number
  notes?: string
  // Giacenza al momento dell'inserimento, per limitare la quantità
  stock: number
}

// Stato condiviso: il carrello resta finché la pagina non viene ricaricata
const items = ref<CartItem[]>([])
const visible = ref(false)
// Incrementato a ogni vendita del carrello, per aggiornare le pagine aperte
const soldTick = ref(0)

export function useCart() {
  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity * item.salePrice, 0),
  )

  const quantityInCart = (productId?: number) =>
    items.value.find((item) => item.productId === productId)?.quantity ?? 0

  // Un solo rigo per prodotto: aggiungere di nuovo somma la quantità e aggiorna prezzo, IVA e note
  const add = (item: CartItem) => {
    const existing = items.value.find((i) => i.productId === item.productId)
    if (existing) Object.assign(existing, item, { quantity: existing.quantity + item.quantity })
    else items.value.push({ ...item })
  }

  const remove = (productId: number) => {
    items.value = items.value.filter((item) => item.productId !== productId)
  }

  const clear = () => {
    items.value = []
  }

  return { items, visible, soldTick, count, total, quantityInCart, add, remove, clear }
}
