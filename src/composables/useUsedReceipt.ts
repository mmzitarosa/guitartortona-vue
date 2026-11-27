import { useForm } from '@/composables/useForm'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useErrorHandler } from '@/utils/errorHandler'
import { type Customer, customerFullName } from '@/types/customer'
import { useToast } from 'primevue'
import type { LedgerChoice, UsedReceipt } from '@/types/usedReceipt'
import { formatDate } from '@/utils/dateUtils'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'
import {
  alignUsedReceiptLedger,
  archiveUsedReceipt,
  confirmUsedReceipt,
  createUsedReceipt,
  deleteUsedReceipt,
  getUsedReceiptDetail,
  ignoreUsedReceiptLedger,
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
  const toast = useToast()
  const { handleApiError } = useErrorHandler()
  let ledgerChoice: LedgerChoice | undefined

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
    hardDelete: (id: number) => deleteUsedReceipt(id, ledgerChoice),
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

  // Eliminazione definitiva: la scelta sul brogliaccio, se serve, è già stata fatta dall'utente
  const handleHardDelete = (choice?: LedgerChoice) => {
    ledgerChoice = choice
    return form.handleHardDelete()
  }

  const alignLedger = (choice: LedgerChoice) =>
    form.withLoading(async () => {
      try {
        const id = form.item.value.id as number
        const updated =
          choice === 'ALIGN' ? await alignUsedReceiptLedger(id) : await ignoreUsedReceiptLedger(id)
        form.setItem(updated)
        toast.add({
          severity: 'success',
          summary: constants.ledgerAlignment.toastTitle,
          detail: constants.ledgerAlignment.toast[choice],
          life: 3000,
        })
        return true
      } catch (error) {
        handleApiError(error)
        return false
      }
    })

  // Dopo una modifica delle righe cambia l'importo: aggiorna solo la differenza col brogliaccio, senza toccare il form
  const refreshLedgerAlignment = async () => {
    const fresh = await getUsedReceiptDetail(form.item.value.id as number)
    form.item.value.ledgerAlignment = fresh.ledgerAlignment
    return fresh.ledgerAlignment
  }

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
    handleHardDelete,
    alignLedger,
    refreshLedgerAlignment,
  }
}
