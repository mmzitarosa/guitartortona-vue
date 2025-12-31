import type { Product, ProductLight } from '@/types/product'

export interface IncomingInvoiceProductLight {
  id?: number
  product?: ProductLight
  purchase?: { id: number; date: Date }
  quantity?: number
  vat?: number
  purchasePrice?: number
}

export interface IncomingInvoiceProduct {
  id?: number
  product?: Product
  purchase?: { id: number; date: Date }
  quantity?: number
  vat?: number
  purchasePrice?: number
}
