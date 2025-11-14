import type { Supplier } from '@/types/supplier.ts'
import type {
  IncomingInvoiceProduct,
  IncomingInvoiceProductDTO
} from '@/types/incominInvoiceProduct.ts'

export interface IncomingInvoice {
  id?: number
  supplier?: Supplier
  date?: string
  number?: string
  amount?: number
  notes?: string
  status?: 'DRAFT' | 'PENDING' | 'COMPLETED' | 'ARCHIVED'
  items?: IncomingInvoiceProduct[]
}

export interface IncomingInvoiceDTO {
  id?: number
  supplier?: Supplier
  supplierId?: number
  supplierName?: string
  date?: string
  number?: string
  amount?: number
  notes?: string
  status?: 'DRAFT' | 'PENDING' | 'COMPLETED' | 'ARCHIVED'
  items?: IncomingInvoiceProductDTO[]
}
