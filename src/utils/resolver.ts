import type { FormResolverOptions } from '@primevue/forms'


export const ledgerTableFilterResolver = ({ values }: FormResolverOptions) => {
  const errors: Record<string, { message?: string }[]> = {}

  const fromDate = validateDate(values.fromDate)
  const toDate = validateDate(values.toDate)

  if (!values.fromDate) {
    if (values.toDate) errors.fromDate = err(LEDGER_TABLE.fromDate.messages.required!)
  } else if (!fromDate) {
    errors.fromDate = err(LEDGER_TABLE.fromDate.messages.other!)
  }

  if (!values.toDate) {
    if (values.fromDate) errors.toDate = err(LEDGER_TABLE.toDate.messages.required!)
  } else if (fromDate && toDate && fromDate > toDate) {
    errors.fromDate = err(LEDGER_TABLE.fromDate.messages.other!)
    errors.toDate = err(LEDGER_TABLE.toDate.messages.other!)
  } else if (!toDate) {
    errors.toDate = err(LEDGER_TABLE.toDate.messages.other!)
  }

  return {
    values,
    errors,
  }
}

const err = (msg: string) => [{ message: msg }]

export const validateDate = (date: string) => {
  if (!date) return
  const [day, month, year] = date.split('/').map(Number)
  const d = new Date(year, month - 1, day)
  return d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day
    ? undefined
    : d
}
