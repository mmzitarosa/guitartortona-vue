import { format, parse } from 'date-fns'
import { isSupplier } from '@/utils/typeGuards.ts'
import type { IncomingInvoice, IncomingInvoiceDTO } from '@/types/incomingInvoice.ts'

// Domain → DTO
export function toDTO(invoice: IncomingInvoice): IncomingInvoiceDTO {
  return {
    id: invoice.id,
    supplier: invoice.supplier,
    supplierId: invoice.supplier?.id,
    supplierName: !isSupplier(invoice.supplier) ? invoice.supplier : undefined,
    date: invoice.date,
    number: invoice.number,
    amount: invoice.amount,
    notes: invoice.notes
  };
}

// DTO → Domain
export function fromDTO(dto: IncomingInvoiceDTO): IncomingInvoice {
  return {
    id: dto.id,
    supplier: dto.supplier,
    date: dto.date,
    number: dto.number,
    amount: dto.amount,
    notes: dto.notes
  };
}
