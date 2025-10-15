import type { Brand } from '@/types/brand.ts'
import type { Category } from '@/types/category.ts'
import type { Product } from '@/types/product.ts'

export interface IncomingInvoiceProduct {
  id?: number
  product?: Product
  quantity?: number
  vat?: number
  purchasePrice?: number
}

export interface IncomingInvoiceProductDTO {
  id?: number
  product?: Product
  productId?: number
  quantity?: number
  vat?: number
  purchasePrice?: number
}
