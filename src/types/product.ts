import type { Brand } from '@/types/brand'
import type { Category } from '@/types/category'
import type { IncomingInvoiceProduct } from '@/types/incomingInvoiceProduct'
import type { Sale } from '@/types/sale'

export interface Product {
  id?: number
  code?: string
  internalCode?: string
  brand?: Brand
  category?: Category
  description?: string
  reorderPoint?: number
  notes?: string
  condition?: 'NEW' | 'USED'
  price?: number
  stock?: number
  pendingStock?: number
  purchases?: IncomingInvoiceProduct[]
  sales?: Sale[]
}

export interface ProductLight {
  id?: number
  brandId?: number
  categoryId: number
  description: string
  condition?: 'NEW' | 'USED'
  price?: number
  stock?: number
  pendingStock?: number
}
