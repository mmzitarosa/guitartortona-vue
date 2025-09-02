import { INCOMING_INVOICE, LEDGER } from './constants'

export const incomingInvoiceResolver = ({ values }) => {
  const errors: Record<string, { message: string }[]> = {}

  // number
  if (!values.number) {
    errors.number = [{ message: INCOMING_INVOICE.number.messages.required! }]
  } else if (values.number.length > 50) {
    errors.number = [{ message: INCOMING_INVOICE.number.messages.tooLong! }]
  }

  // supplier
  if (!values.supplier) {
    errors.supplier = [{ message: INCOMING_INVOICE.supplier.messages.required! }]
  } else if (values.supplier.length > 150) {
    errors.supplier = [{ message: INCOMING_INVOICE.supplier.messages.tooLong! }]
  }

  // date
  if (!values.date) {
    errors.date = [{ message: INCOMING_INVOICE.date.messages.required! }]
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
    errors,
  }
}



export const ledgerEntryResolver = ({ values }) => {
  const errors: Record<string, { message: string }[]> = {}

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

  // amount
  if (values.amount && values.amount <= 0) {
    errors.amount = [{ message: LEDGER.amount.messages.other! }]
  }

  // reason
  // paymentMethod
  // bank
  // paymentType
  // movementType
  // notes → opzionale, nessuna validazione

  return {
    values,
    errors,
  }
}

const validateDate = (date: string) => {
  if (!date) return
  const [day, month, year] = date.split('/').map(Number)
  const d = new Date(year, month - 1, day)
  return !(d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day);
}
