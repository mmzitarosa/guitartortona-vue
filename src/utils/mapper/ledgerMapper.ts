import type { LedgerEntry, LedgerEntryDTO, LedgerEntryLight } from '@/types/ledgerEntry'
import { formatDate, parseDate } from '@/utils/dateUtils'

// Domain → DTO
export function toDTO(ledgerEntry: LedgerEntry): LedgerEntryDTO {
  return {
    id: ledgerEntry.id,
    date: formatDate(ledgerEntry.date),
    invoiceNumber: ledgerEntry.invoiceNumber,
    invoiceDate: formatDate(ledgerEntry.invoiceDate),
    description: ledgerEntry.description,
    reason: ledgerEntry.reason,
    paymentType: ledgerEntry.paymentType,
    receiptNumber: ledgerEntry.receiptNumber,
    paymentMethod: ledgerEntry.paymentMethod,
    bank: ledgerEntry.bank,
    bankId: ledgerEntry.bank?.id,
    movementType: ledgerEntry.movementType,
    amount: ledgerEntry.amount,
    notes: ledgerEntry.notes,
    status: ledgerEntry.status
  }
}

// DTO → Domain
export function fromDTO(dto: LedgerEntryDTO): LedgerEntry {
  return {
    id: dto.id,
    date: parseDate(dto.date),
    invoiceNumber: dto.invoiceNumber,
    invoiceDate: parseDate(dto.invoiceDate),
    description: dto.description,
    reason: dto.reason,
    paymentType: dto.paymentType,
    receiptNumber: dto.receiptNumber,
    paymentMethod: dto.paymentMethod,
    bank: dto.bank,
    movementType: dto.movementType,
    amount: dto.amount,
    notes: dto.notes,
    status: dto.status
  }
}

export function fromLightDTO(dto: LedgerEntryDTO): LedgerEntryLight {
  return {
    id: dto.id,
    date: parseDate(dto.date),
    invoiceNumber: dto.invoiceNumber,
    invoiceDate: parseDate(dto.invoiceDate),
    description: dto.description,
    reason: dto.reason,
    paymentType: dto.paymentType,
    receiptNumber: dto.receiptNumber,
    paymentMethod: dto.paymentMethod,
    bankId: dto.bankId,
    movementType: dto.movementType,
    amount: dto.amount,
    status: dto.status
  }
}
