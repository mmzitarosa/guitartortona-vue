import type { Supplier } from '@/types/supplier.ts'
import type {
  IncomingInvoiceProduct,
  IncomingInvoiceProductDTO,
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

export function isEditable(invoice: IncomingInvoice): boolean {
  return invoice.status === 'DRAFT'
}
export function addProductToInvoice(
  invoice: IncomingInvoice,
  product: IncomingInvoiceProduct,
): void {
  if (!invoice.items) {
    invoice.items = []
  }
  invoice.items.push(product)
}
