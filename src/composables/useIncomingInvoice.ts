import { useForm } from '@/composables/useForm'
import type { IncomingInvoice } from '@/types/incomingInvoice'
import type { Supplier } from '@/types/supplier'
import {
  deleteIncomingInvoiceById,
  getIncomingInvoiceById,
  postIncomingInvoice,
  putIncomingInvoiceById,
  completeIncomingInvoiceById,
} from '@/services/api/incomingInvoiceService'
import { validateDate } from '@/utils/dateUtils'
import { useIncomingInvoiceConstants } from '@/utils/i18nConstants'

export function useIncomingInvoice() {
  const constants = useIncomingInvoiceConstants()

  const form = useForm<IncomingInvoice>({
    initialValue: {
      items: [], // Inizializza la lista prodotti
    },
    getById: getIncomingInvoiceById,
    create: postIncomingInvoice,
    update: putIncomingInvoiceById,
    complete: completeIncomingInvoiceById,
    remove: deleteIncomingInvoiceById,
    fieldMappings: [
      {
        key: 'supplier',
        label: constants.supplier.label,
        labeler: (supplier: Supplier | undefined) => supplier?.name,
        validator: (supplier: Supplier | undefined) => {
          if (!supplier) return { message: constants.supplier.messages.required }
          else if (supplier.name && supplier.name.length > 150)
            return { message: constants.supplier.messages.tooLong }
        },
      },
      {
        key: 'date',
        label: constants.date.label,
        validator: (date: string | undefined) => {
          if (!date) return { message: constants.date.messages.required }
          else if (!validateDate(date)) return { message: constants.date.messages.invalid }
        },
      },
      {
        key: 'number',
        label: constants.number.label,
        validator: (number: string | undefined) => {
          if (!number) return { message: constants.number.messages.required }
          else if (number.length > 50) return { message: constants.number.messages.tooLong }
        },
      },
      {
        key: 'amount',
        label: constants.amount.label,
        labeler: (amount: number | undefined) =>
          amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
        validator: (amount: number | undefined) => {
          if (!amount) return { message: constants.amount.messages.required }
          else if (amount < 0) return { message: constants.amount.messages.invalid }
        },
      },
      { key: 'notes', label: constants.notes.label },
    ],
  })

  return {
    ...form,
    constants,
  }
}
