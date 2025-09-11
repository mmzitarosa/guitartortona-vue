import type { LedgerEntry, LedgerEntryDTO } from '@/types/ledgerEntry.ts'

// Domain → DTO
export function toDTO(ledgerEntry: LedgerEntry): LedgerEntryDTO {
  return {
    id: ledgerEntry.id,
    date: ledgerEntry.date,
    invoiceNumber: ledgerEntry.invoiceNumber,
    invoiceDate: ledgerEntry.invoiceDate,
    description: ledgerEntry.description,
    reason: ledgerEntry.reason,
    paymentType: ledgerEntry.paymentType,
    receiptNumber: ledgerEntry.receiptNumber,
    paymentMethod: ledgerEntry.paymentMethod,
    bank: ledgerEntry.bank,
    bankId: ledgerEntry.bank?.id,
    movementType: ledgerEntry.movementType,
    amount: ledgerEntry.amount,
    notes: ledgerEntry.notes
  }
}

// DTO → Domain
export function fromDTO(dto: LedgerEntryDTO): LedgerEntry {
  return {
    id: dto.id,
    date: dto.date,
    invoiceNumber: dto.invoiceNumber,
    invoiceDate: dto.invoiceDate,
    description: dto.description,
    reason: dto.reason,
    paymentType: dto.paymentType,
    receiptNumber: dto.receiptNumber,
    paymentMethod: dto.paymentMethod,
    bank: dto.bank,
    movementType: dto.movementType,
    amount: dto.amount,
    notes: dto.notes
  }
}

export function fromDTOPage(dtoPage: { content: LedgerEntryDTO[], totalElements: number}): {content: LedgerEntry[], totalElements: number} {
  return {content: dtoPage.content.flatMap(dto => fromDTO(dto)), totalElements: dtoPage.totalElements}
}

