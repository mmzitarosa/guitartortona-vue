import type { Supplier } from '@/types/supplier'
import type { IncomingInvoiceProduct } from '@/types/incomingInvoiceProduct'

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'COMPLETED'

export interface IncomingInvoice {
  id?: number
  number?: string
  supplier?: Supplier
  date?: Date
  amount?: number
  notes?: string
  status?: InvoiceStatus
  items?: IncomingInvoiceProduct[]
  daysLeft?: number
}

export interface IncomingInvoiceLight {
  id?: number
  number: string
  supplierId: number
  date: Date
  amount: number
  status: InvoiceStatus
  daysLeft?: number
}

export function isEditable(invoice: IncomingInvoice): boolean {
  return invoice.status === 'DRAFT'
}

export function addProductToInvoice(
  invoice: IncomingInvoice,
  product: IncomingInvoiceProduct,
): void {
  if (!invoice.items) invoice.items = []

  const existingIndex = product.id ? invoice.items.findIndex((item) => item.id === product.id) : -1

  if (existingIndex !== -1) {
    invoice.items[existingIndex] = product
  } else {
    invoice.items.push(product)
  }
}

export function removeProductFromInvoice(invoice: IncomingInvoice, productId: number): boolean {
  if (!invoice.items?.length) return false

  const initialLength = invoice.items.length
  invoice.items = invoice.items.filter((item) => item.id !== productId)

  return invoice.items.length < initialLength
}
