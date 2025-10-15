import type { IncomingInvoice, IncomingInvoiceDTO } from '@/types/incomingInvoice.ts'
import type {
  IncomingInvoiceProduct,
  IncomingInvoiceProductDTO
} from '@/types/incominInvoiceProduct.ts'

// Domain → DTO
export function toDTO(invoice: IncomingInvoice): IncomingInvoiceDTO {
  return {
    id: invoice.id,
    supplier: invoice.supplier,
    supplierId: invoice.supplier?.id,
    supplierName: invoice.supplier?.name,
    date: invoice.date,
    number: invoice.number,
    amount: invoice.amount,
    notes: invoice.notes,
    items: invoice.items?.map(toProductDTO)
  }
}

// DTO → Domain
export function fromDTO(dto: IncomingInvoiceDTO): IncomingInvoice {
  return {
    id: dto.id,
    supplier: dto.supplier,
    date: dto.date,
    number: dto.number,
    amount: dto.amount,
    notes: dto.notes,
    items: dto.items?.map(fromProductDTO)
  }
}

// Domain → DTO
export function toProductDTO(incomingInvoiceProduct: IncomingInvoiceProduct): IncomingInvoiceProductDTO {
  return {
    id: incomingInvoiceProduct.id,
    product: incomingInvoiceProduct.product,
    productId: incomingInvoiceProduct.product?.id,
    vat: incomingInvoiceProduct.vat,
    purchasePrice: incomingInvoiceProduct.purchasePrice,
    quantity: incomingInvoiceProduct.quantity
  }
}


// DTO → Domain
export function fromProductDTO(dto: IncomingInvoiceProductDTO): IncomingInvoiceProduct {
  return {
    id: dto.id,
    product: dto.product,
    vat: dto.vat,
    purchasePrice: dto.purchasePrice,
    quantity: dto.quantity
  }
}
