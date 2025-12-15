import type { Supplier } from '@/types/supplier.ts'
import type {
  IncomingInvoiceProduct,
  IncomingInvoiceProductDTO,
} from '@/types/incominInvoiceProduct.ts'

export interface IncomingInvoice {
  id?: number
  supplier?: Supplier
  date?: Date
  number?: string
  amount?: number
  notes?: string
  status?: 'DRAFT' | 'PENDING' | 'COMPLETED'
  items?: IncomingInvoiceProduct[]
}

export interface IncomingInvoiceLight {
  id?: number
  number?: string
  supplierId?: number
  date?: Date
  amount?: number
  status?: 'DRAFT' | 'PENDING' | 'COMPLETED'
  daysLeft?: number
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
  status?: 'DRAFT' | 'PENDING' | 'COMPLETED'
  items?: IncomingInvoiceProductDTO[]
  daysLeft?: number
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

  // Se il prodotto ha un id, cerca se esiste già nella lista
  if (product.id !== undefined) {
    const existingIndex = invoice.items.findIndex((item) => item.id === product.id)
    if (existingIndex !== -1) {
      // Aggiorna il prodotto esistente
      invoice.items[existingIndex] = product
      return
    }
  }

  // Se non esiste o non ha id, aggiungilo
  invoice.items.push(product)
}

export function removeProductFromInvoice(
  invoice: IncomingInvoice,
  IncomingInvoiceProductId: number,
): boolean {
  if (!invoice.items || invoice.items.length === 0) {
    return false
  }

  const existingIndex = invoice.items.findIndex((item) => item.id === IncomingInvoiceProductId)
  if (existingIndex !== -1) {
    invoice.items.splice(existingIndex, 1)
    return true
  }

  return false
}
