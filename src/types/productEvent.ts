export interface ProductEvent {
  type: 'PURCHASE' | 'SALE'
  date?: string
  quantity?: number
  price?: number
  vat?: number
  notes?: string
  invoiceId?: number
  invoiceNumber?: string
  supplier?: string
  status?: string
}
