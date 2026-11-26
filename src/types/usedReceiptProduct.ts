import type { Product, ProductLight } from '@/types/product'

export interface UsedReceiptProductLight {
  id?: number
  product?: ProductLight & { internalCode?: string; notes?: string }
  vat?: number
  purchasePrice?: number
  letter?: string
  reference?: string
}

export interface UsedReceiptProduct {
  id?: number
  product?: Product
  vat?: number
  purchasePrice?: number
  letter?: string
  reference?: string
}
