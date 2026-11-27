import type { Customer } from '@/types/customer'
import type { UsedReceiptProduct } from '@/types/usedReceiptProduct'

export type UsedReceiptStatus = 'DRAFT' | 'PENDING' | 'COMPLETED'

/** Valori di una riga di brogliaccio; la data arriva già formattata (gg/mm/aaaa) */
export interface LedgerAlignmentValues {
  date?: string
  reason?: string
  amount?: number
}

/**
 * Differenza tra la ricevuta registrata e la riga di brogliaccio che ne è nata.
 * UPDATE: la riga va aggiornata ai valori proposti; ARCHIVE: la ricevuta è eliminata, la riga va eliminata.
 */
export interface LedgerAlignment {
  ledgerEntryId: number
  action: 'UPDATE' | 'ARCHIVE'
  current: LedgerAlignmentValues
  proposed?: LedgerAlignmentValues
}

/** Cosa fare della riga di brogliaccio: ALIGN la porta ai valori della ricevuta (o la elimina), IGNORE la lascia com'è */
export type LedgerChoice = 'ALIGN' | 'IGNORE'

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
  ledgerEntryId?: number
  ledgerEntryArchived?: boolean
  ledgerAlignment?: LedgerAlignment
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
