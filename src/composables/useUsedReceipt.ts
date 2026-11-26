import { useForm } from '@/composables/useForm'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { type Customer, customerFullName } from '@/types/customer'
import type { UsedReceipt } from '@/types/usedReceipt'
import { formatDate } from '@/utils/dateUtils'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'
import {
  archiveUsedReceipt,
  confirmUsedReceipt,
  createUsedReceipt,
  deleteUsedReceipt,
  getUsedReceiptDetail,
  registerUsedReceipt,
  restoreUsedReceipt,
  updateUsedReceipt,
} from '@/services/api/usedReceiptService'

// Sintesi di tutti i dati cliente: serve a riconoscere anche le modifiche al solo indirizzo
const customerSummary = (customer?: Customer) =>
  customer
    ? [
        customerFullName(customer),
        customer.address,
        customer.zipCode,
        customer.city,
        customer.province,
        customer.documentType,
        customer.documentNumber,
        customer.taxCode,
      ]
        .filter(Boolean)
        .join(', ')
    : undefined

export function useUsedReceipt() {
  const constants = useUsedReceiptConstants()
  const confirmDialog = useConfirmDialog()

  const fieldMappings = [
    {
      key: 'date',
      label: constants.date.label,
      labeler: (date?: Date) => formatDate(date),
      validator: (date?: Date) => {
        if (!date) return { message: constants.date.messages.required }
      },
    },
    {
      key: 'customer',
      label: constants.customer.label,
      labeler: customerSummary,
    },
    {
      key: 'notes',
      label: constants.notes.label,
      validator: (notes?: string) => {
        if (notes && notes.length > 255) return { message: constants.notes.messages.tooLong }
      },
    },
  ]

  const form = useForm<UsedReceipt>({
    initialValue: { items: [], date: new Date() },
    getById: getUsedReceiptDetail,
    create: createUsedReceipt,
    update: updateUsedReceipt,
    complete: confirmUsedReceipt,
    archive: archiveUsedReceipt,
    restore: restoreUsedReceipt,
    hardDelete: deleteUsedReceipt,
    mapResponse: (receipt: UsedReceipt) => receipt,
    fieldMappings,
  })

  // La registrazione assegna il numero: è definitiva, quindi chiede conferma
  const handleRegister = () =>
    confirmDialog.require<UsedReceipt>({
      header: constants.register.title,
      message: constants.register.message,
      icon: 'pi pi-info-circle',
      acceptLabel: constants.register.acceptLabel,
      toastSummary: constants.register.toastTitle,
      toastDetail: constants.register.toastMessage,
      accept: () =>
        form.withLoading(async () => {
          const registered = await registerUsedReceipt(form.item.value.id as number)
          form.setItem(registered)
          return registered
        }),
    })

  return {
    usedReceipt: form.item,
    loading: form.loading,
    validation: form.validation,
    changes: form.changes,
    dirty: form.dirty,
    pristine: form.pristine,
    existingItem: form.existingItem,
    loadUsedReceipt: form.loadItem,
    handleSubmit: form.handleSubmit,
    handleComplete: form.handleComplete,
    handleRegister,
    handleReset: form.handleReset,
    handleClose: form.handleClose,
    handleArchive: form.handleArchive,
    handleRestore: form.handleRestore,
    handleHardDelete: form.handleHardDelete,
  }
}
