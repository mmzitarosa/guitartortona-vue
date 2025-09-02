import { computed, type ComputedRef, ref } from 'vue'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'
import { useConfirm, useToast } from 'primevue'
import { LEDGER } from '@/utils/constants.ts'
import {
  type LedgerEntry,
  movementTypesMap,
  paymentMethodsMap,
  paymentTypesMap
} from '@/types/ledgerEntry.ts'
import type { Bank } from '@/types/bank.ts'
import {
  deleteLedgerEntryById,
  getLedgerEntryById,
  postLedgerEntry,
  putLedgerEntryById
} from '@/services/api/ledgerService.ts'

export const useLedgerEntryForm = () => {

  const constants = LEDGER

  const loading = ref(false)
  const confirm = useConfirm()
  const toast = useToast()

  const ledgerEntry = ref<LedgerEntry>({})
  const ledgerEntryOriginal = ref<LedgerEntry>({})

  const fieldMappings: {
    key: keyof LedgerEntry
    label: string
    getter?: (v: any) => unknown
    labeler?: (v: any) => unknown
  }[] =
    [
      { key: 'date', label: 'Data' },
      { key: 'invoiceNumber', label: 'NumeroF' },
      { key: 'invoiceDate', label: 'DataF' },
      { key: 'description', label: 'Descrizione' },
      { key: 'reason', label: 'Causale' },
      {
        key: 'paymentType',
        label: 'S / A',
        labeler: (v: string) => v ? paymentTypesMap[v].label : undefined
      },
      { key: 'receiptNumber', label: 'Ultime 3 Cifre a/b' },
      {
        key: 'paymentMethod',
        label: 'Cassa / Banca',
        labeler: (v: string) => v ? paymentMethodsMap[v].label : undefined
      },
      {
        key: 'bank',
        label: 'Banca',
        getter: (v: Bank) => v ? v.id : undefined,
        labeler: (v: Bank) => v ? v.name : undefined
      },
      {
        key: 'movementType',
        label: 'Entrata / Uscita',
        labeler: (v: string) => v ? movementTypesMap[v].label : undefined
      },
      {
        key: 'amount',
        label: 'Importo',
        labeler: (v: number) => v?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
      },
      { key: 'notes', label: 'Note' }
    ]

  const changes: ComputedRef<{ field: string, oldValue: any, newValue: any }[]> = computed(() => {
    //Confronto l'oggetto ledgerEntry con l'originale
    return fieldMappings.flatMap(({ key, label, getter, labeler }) => {
      const oldVal = getter ? getter(ledgerEntryOriginal.value[key]) : ledgerEntryOriginal.value[key]
      const newVal = getter ? getter(ledgerEntry.value[key]) : ledgerEntry.value[key]

      if (oldVal !== newVal) {
        const oldLabel = labeler ? labeler(ledgerEntryOriginal.value[key]) : ledgerEntryOriginal.value[key]
        const newLabel = labeler ? labeler(ledgerEntry.value[key]) : ledgerEntry.value[key]
        return [{ field: label, oldValue: oldLabel, newValue: newLabel }]
      }
      return []
    })
  })

  const hasChanges: ComputedRef<boolean> = computed(() => {
    return changes.value.length > 0
  })

  const isUpdate = computed(() => ledgerEntry.value?.id !== undefined)

  const handleSubmit = () => {
    return new Promise<IncomingInvoice>((resolve, error) => {
      const dialogConstants = isUpdate.value ? constants.updateDialog : constants.saveDialog
      confirm.require({
        header: dialogConstants?.title,
        group: 'differences',
        message: dialogConstants?.message,
        icon: dialogConstants?.icon,
        rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
        acceptProps: { label: dialogConstants?.acceptLabel, text: true },
        accept: () => {
          (isUpdate.value ? updateLedgerEntry(ledgerEntry.value.id as number) : createLedgerEntry()).then(
            result => {
              ledgerEntry.value = result
              ledgerEntryOriginal.value = { ...result }
              toast.add({ severity: 'success', summary: dialogConstants?.toastTitle, detail: dialogConstants?.toastMessage, life: 3000 })
              resolve(result)
            }, e => {
              toast.add({ severity: 'error', summary: e.name, detail: e.message, life: 3000 })
              error(e)
            }
          )
        }
      })
    })
  }

  const handleReset = () => {
    return new Promise<void>((resolve) => {
      const dialogConstants = constants.resetDialog
      confirm.require({
        header: dialogConstants?.title,
        message: dialogConstants?.message,
        icon: dialogConstants?.icon,
        rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
        acceptProps: { label: dialogConstants?.acceptLabel, severity: 'contrast', text: true },
        accept: () => {
          ledgerEntry.value = { ...ledgerEntryOriginal.value }
          toast.add({ severity: 'success', summary: dialogConstants?.toastTitle, detail: dialogConstants?.toastMessage, life: 3000 })
          resolve()
        }
      })
    })
  }

  const handleClose = () => {
    return new Promise<void>((resolve) => {
      const dialogConstants = constants.cancelDialog
      if (!hasChanges.value) {
        resolve()
      } else {
        confirm.require({
          header: dialogConstants?.title,
          message: dialogConstants?.message,
          icon: dialogConstants?.icon,
          rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
          acceptProps: { label: dialogConstants?.acceptLabel, severity: 'contrast', text: true },
          accept: () => {
            toast.add({ severity: 'success', summary: dialogConstants?.toastTitle, detail: dialogConstants?.toastMessage, life: 3000 })
            resolve()
          }
        })
      }
    })
  }

  const handleDelete = () => {
    return new Promise<void>((resolve, error) => {
      const dialogConstants = constants.deleteDialog
      confirm.require({
        header: dialogConstants?.title,
        message: dialogConstants?.message,
        icon: dialogConstants?.icon,
        rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
        acceptProps: { label: dialogConstants?.acceptLabel, severity: 'contrast', text: true },
        accept: () => {
          if (!ledgerEntry.value.id) return
          deleteLedgerEntry(ledgerEntry.value.id).then(
            () => {
              toast.add({ severity: 'success', summary: dialogConstants?.toastTitle, detail: dialogConstants?.toastMessage, life: 3000 })
              resolve()
            }, e => {
              toast.add({ severity: 'error', summary: e.name, detail: e.message, life: 3000 })
              error(e)
            }
          )
        }
      })
    })
  }

  const loadLedgerEntry = async (id: number) => {
    loading.value = true
    try {
      ledgerEntry.value = await getLedgerEntryById(id)
      ledgerEntryOriginal.value = { ...ledgerEntry.value }
    } finally {
      loading.value = false
    }
    return ledgerEntry.value
  }

  const createLedgerEntry = () => {
    loading.value = true
    return new Promise<LedgerEntry>(async (resolve, error) => {
      try {
        resolve(await postLedgerEntry(ledgerEntry.value))
      } catch (e) {
        error(e)
      } finally {
        loading.value = false
      }
    })
  }

  const updateLedgerEntry = (id: number) => {
    loading.value = true
    return new Promise<LedgerEntry>(async (resolve, error) => {
      try {
        resolve(await putLedgerEntryById(id, ledgerEntry.value))
      } catch (e) {
        error(e)
      } finally {
        loading.value = false
      }
    })
  }

  const deleteLedgerEntry = (id: number) => {
    loading.value = true
    return new Promise<void>(async (resolve, error) => {
      try {
        await deleteLedgerEntryById(id)
        resolve()
      } catch (e) {
        error(e)
      } finally {
        loading.value = false
      }
    })
  }

  return {
    ledgerEntry,
    ledgerEntryOriginal,
    loadLedgerEntry,
    changes,
    hasChanges,
    loading,
    handleSubmit,
    handleReset,
    handleClose,
    handleDelete
  }

}
