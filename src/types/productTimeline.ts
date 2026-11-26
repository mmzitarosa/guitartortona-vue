export type TimelineEntryType =
  | 'SALE'
  | 'PURCHASE'
  | 'PURCHASE_CHANGE'
  | 'PRODUCT_CHANGE'
  | 'PRODUCT_CREATED'

export interface TimelineFieldChange {
  field: string
  oldValue?: string
  newValue?: string
}

export interface TimelineEntry {
  type: TimelineEntryType
  /** yyyy-MM-dd */
  date: string
  /** ISO date-time dell'ultima modifica */
  at?: string
  users?: string
  quantity?: number
  price?: number
  vat?: number
  previousPrice?: number
  previousVat?: number
  notes?: string
  status?: string
  invoiceId?: number
  invoiceNumber?: string
  supplier?: string
  receiptId?: number
  receiptNumber?: string
  /** Campi poi sovrascritti da una modifica successiva */
  superseded?: string[]
  changes?: TimelineFieldChange[]
}

export interface ProductTimeline {
  purchased: number
  sold: number
  entries: TimelineEntry[]
}
