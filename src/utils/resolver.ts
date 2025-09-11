import { INCOMING_INVOICE, LEDGER, LEDGER_TABLE } from './constants'
import type { LedgerEntry } from '@/types/ledgerEntry.ts'
import type { FormResolverOptions } from '@primevue/forms'

export const incomingInvoiceResolver = ({ values }: FormResolverOptions) => {
  const errors: Record<string, { message: string }[]> = {}

  // number
  if (!values.number) {
    errors.number = [{ message: INCOMING_INVOICE.number.messages.required! }]
  } else if (values.number.length > 50) {
    errors.number = [{ message: INCOMING_INVOICE.number.messages.tooLong! }]
  }

  console.log(values.supplier.length)
  // supplier
  if (!values.supplier) {
    errors.supplier = [{ message: INCOMING_INVOICE.supplier.messages.required! }]
  } else if (values.supplier.length > 150) {
    errors.supplier = [{ message: INCOMING_INVOICE.supplier.messages.tooLong! }]
  }

  // date
  if (!values.date) {
    errors.date = [{ message: INCOMING_INVOICE.date.messages.required! }]
  } else if (!validateDate(values.date)) {
    errors.date = [{ message: INCOMING_INVOICE.date.messages.other! }]
  }

  // amount
  if (values.amount == null) {
    errors.amount = [{ message: INCOMING_INVOICE.amount.messages.required! }]
  } else if (values.amount <= 0) {
    errors.amount = [{ message: INCOMING_INVOICE.amount.messages.other! }]
  }

  // notes → opzionale, nessuna validazione

  return {
    values,
    errors
  }
}

export const ledgerEntryResolver = ({ values }: FormResolverOptions) => {
  const errors: Record<string, { message?: string }[]> = {}

  // date
  if (!values.date) {
    errors.date = [{ message: LEDGER.date.messages.required! }]
  } else if (!validateDate(values.date)) {
    errors.date = [{ message: LEDGER.date.messages.other! }]
  }

  // invoiceNumber
  if (values.invoiceNumber && values.invoiceNumber.length > 50) {
    errors.invoiceNumber = [{ message: LEDGER.invoiceNumber.messages.tooLong! }]
  }

  // invoiceDate
  if (values.invoiceDate && !validateDate(values.invoiceDate)) {
    errors.invoiceDate = [{ message: LEDGER.invoiceDate.messages.other! }]
  }

  // description
  if (values.description == null) {
    errors.description = [{ message: LEDGER.description.messages.required! }]
  } else if (values.description.length > 255) {
    errors.description = [{ message: LEDGER.description.messages.tooLong! }]
  }

  // receiptNumber
  if (values.receiptNumber && values.receiptNumber.length > 5) {
    errors.receiptNumber = [{ message: LEDGER.receiptNumber.messages.tooLong! }]
  }

  // bank && paymentMethod
  if (!values.bank && values.paymentMethod === 'BANK') {
    errors.bank = [{ message: LEDGER.bank.messages.required! }]
  } else if (values.bank && values.paymentMethod !== 'BANK') {
    errors.paymentMethod = [{}]
  } else if (!values.paymentMethod && (values.amount || values.movementType)) {
    errors.paymentMethod = [{}]
  }

  //movementType
  if (!values.movementType && (values.amount || values.paymentMethod)) {
    errors.movementType = [{}]
  }

  // amount
  if (values.amount) {
    if (values.amount <= 0) {
      errors.amount = [{ message: LEDGER.amount.messages.other! }]
    }
  } else if (!(!values.movementType && !values.paymentMethod)) {
    errors.amount = [{ message: LEDGER.amount.messages.required! }]
  }

  // reason
  // paymentType
  // notes → opzionale, nessuna validazione

  return {
    values,
    errors
  }
}

export const ledgerTableFilterResolver = ({ values }: FormResolverOptions) => {
  const errors: Record<string, { message?: string }[]> = {}

  const fromDate = validateDate(values.fromDate)
  const toDate = validateDate(values.toDate)

  if (!values.fromDate) {
    if (values.toDate) errors.fromDate = [{ message: LEDGER_TABLE.fromDate.messages.required! }]
  } else if (!fromDate) {
    errors.fromDate = [{ message: LEDGER_TABLE.fromDate.messages.other! }]
  }

  if (!values.toDate) {
    if (values.fromDate) errors.toDate = [{ message: LEDGER_TABLE.toDate.messages.required! }]
  } else if (fromDate && toDate && fromDate>toDate) {
    errors.fromDate = [{ message: LEDGER_TABLE.fromDate.messages.other! }]
    errors.toDate = [{ message: LEDGER_TABLE.toDate.messages.other! }]
  } else if (!toDate) {
    errors.toDate = [{ message: LEDGER_TABLE.toDate.messages.other! }]
  }

  return {
    values,
    errors
  }
}

const validateDate = (date: string) => {
  if (!date) return
  const [day, month, year] = date.split('/').map(Number)
  const d = new Date(year, month - 1, day)
  return (d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day) ? undefined : d
}
