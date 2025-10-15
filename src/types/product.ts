import type { Brand } from '@/types/brand.ts'
import type { Category } from '@/types/category.ts'

export interface Product {
  id?: number
  code?: string
  internalCode?: string
  category?: Category
  brand?: Brand
  description?: string
  condition?: 'NEW' | 'USED'
  price?: number
  reorderPoint?: number
  notes?: string
}

export interface ProductDTO {
  id?: number
  code?: string
  internalCode?: string
  category?: Category
  categoryId?: number
  brand?: Brand
  brandId?: number
  brandName?: string
  description?: string
  condition?: 'NEW' | 'USED'
  price?: number
  reorderPoint?: number
  notes?: string
}
