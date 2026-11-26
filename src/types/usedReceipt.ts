import type { Customer } from '@/types/customer'
import type { UsedReceiptProduct } from '@/types/usedReceiptProduct'

export type UsedReceiptStatus = 'DRAFT' | 'PENDING' | 'COMPLETED'

export interface UsedReceipt {
  id?: number
  internalCode?: string
  number?: string
  date?: Date
  amount?: number
  notes?: string
  status?: UsedReceiptStatus
  archived?: boolean
  customer?: Customer
  updateCustomer?: boolean
  items?: UsedReceiptProduct[]
}

export interface UsedReceiptLight {
  id?: number
  date: Date
  customer?: string
  number?: string
  amount: number
  status: UsedReceiptStatus
  items?: UsedReceiptLightItem[]
}

/** Dati di vendita e margine presenti solo a vendita effettuata */
export interface UsedReceiptLightItem {
  id: number
  productId: number
  reference?: string
  category?: string
  brand?: string
  description?: string
  cost?: number
  saleDate?: string
  salePrice?: number
  margin?: number
  saleVat?: number
  saleReceipt?: string
}

/** Bozza non eliminata: si può confermare */
export function canConfirm(receipt: UsedReceipt): boolean {
  return receipt.status === 'DRAFT' && !receipt.archived
}

/** Confermata non eliminata: si può registrare (numero) */
export function canRegister(receipt: UsedReceipt): boolean {
  return receipt.status === 'PENDING' && !receipt.archived
}

/** La stampa è possibile dalla conferma in poi */
export function isPrintable(receipt: UsedReceipt): boolean {
  return (receipt.status === 'PENDING' || receipt.status === 'COMPLETED') && !receipt.archived
}

/** Modificabile se non eliminata e (bozza oppure admin) */
export function isModifiable(receipt: UsedReceipt, isAdmin: boolean): boolean {
  return !receipt.archived && (receipt.status === 'DRAFT' || isAdmin)
}

export function receiptAmount(receipt: UsedReceipt): number {
  return (receipt.items ?? []).reduce((total, item) => total + (item.purchasePrice ?? 0), 0)
}

export function addProductToReceipt(receipt: UsedReceipt, item: UsedReceiptProduct): void {
  if (!receipt.items) receipt.items = []
  const index = item.id ? receipt.items.findIndex((i) => i.id === item.id) : -1
  if (index !== -1) receipt.items[index] = item
  else receipt.items.push(item)
  receipt.amount = receiptAmount(receipt)
}

export function removeProductFromReceipt(receipt: UsedReceipt, itemId: number): void {
  receipt.items = (receipt.items ?? []).filter((item) => item.id !== itemId)
  receipt.amount = receiptAmount(receipt)
}
