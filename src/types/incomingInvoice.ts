import type { Supplier } from '@/types/supplier.ts'

export interface IncomingInvoice {
  id?: number;
  supplier?: Supplier;
  date?: string;
  number?: string;
  amount?: number;
  notes?: string;
}

// Il DTO ha date come stringa perché così vuole il backend
export interface IncomingInvoiceDTO {
  id?: number;
  supplier?: Supplier;
  supplierId?: number;
  supplierName?: string;
  date?: string;
  number?: string;
  amount?: number;
  notes?: string;
}
