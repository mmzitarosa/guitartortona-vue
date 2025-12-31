import { useForm } from '@/composables/useForm'
import type { IncomingInvoice } from '@/types/incomingInvoice'
import type { Supplier } from '@/types/supplier'
import { formatDate } from '@/utils/dateUtils'
import { useIncomingInvoiceConstants } from '@/utils/i18nConstants'
import {
  completeIncomingInvoice,
  createIncomingInvoice,
  deleteIncomingInvoice,
  getIncomingInvoiceDetail,
  updateIncomingInvoice,
} from '@/services/api/incomingInvoiceService'
import { formatCurrency } from '@/utils/currencyUtils'

export function useIncomingInvoice() {
  const constants = useIncomingInvoiceConstants()

  const initialValue = {
    items: [], // Inizializza la lista prodotti
  }

  const fieldMappings = [
    {
      key: 'supplier',
      label: constants.supplier.label,
      labeler: (supplier?: Supplier) => supplier?.name,
      validator: (supplier?: Supplier) => {
        if (!supplier) return { message: constants.supplier.messages.required }
        else if (supplier.name && supplier.name.length > 150)
          return { message: constants.supplier.messages.tooLong }
      },
    },
    {
      key: 'date',
      label: constants.date.label,
      labeler: (date?: Date) => formatDate(date),
      validator: (date?: Date) => {
        if (!date) return { message: constants.date.messages.required }
      },
    },
    {
      key: 'number',
      label: constants.number.label,
      validator: (number?: string) => {
        if (!number) return { message: constants.number.messages.required }
        else if (number.length > 50) return { message: constants.number.messages.tooLong }
      },
    },
    {
      key: 'amount',
      label: constants.amount.label,
      labeler: formatCurrency,
      validator: (amount?: number) => {
        if (!amount) return { message: constants.amount.messages.required }
        else if (amount < 0) return { message: constants.amount.messages.invalid }
      },
    },
    { key: 'notes', label: constants.notes.label },
  ]

  const form = useForm<IncomingInvoice>({
    initialValue,
    getById: getIncomingInvoiceDetail,
    create: createIncomingInvoice,
    update: updateIncomingInvoice,
    complete: completeIncomingInvoice,
    remove: deleteIncomingInvoice,
    fieldMappings,
  })

  return {
    incomingInvoice: form.item,
    loading: form.loading,
    validation: form.validation,
    changes: form.changes,
    dirty: form.dirty,
    pristine: form.pristine,
    existingItem: form.existingItem,
    loadIncomingInvoice: form.loadItem,
    handleSubmit: form.handleSubmit,
    handleComplete: form.handleComplete,
    handleReset: form.handleReset,
    handleClose: form.handleClose,
    handleDelete: form.handleDelete,
  }
}
