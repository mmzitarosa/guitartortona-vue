import { computed, type ComputedRef, type Ref, ref } from 'vue'
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
  deleteLedgerEntryById, getLedger,
  getLedgerEntryById,
  postLedgerEntry,
  putLedgerEntryById
} from '@/services/api/ledgerService.ts'

export const useLedgerTable = () => {

  const ledger = ref([{}])
  const totalRecords = ref(0)
  const loading = ref(false)
  const selectedLedgerEntry: Ref<LedgerEntry | undefined> = ref(undefined)

  const loadLedger = async (fromDate?: string, toDate?: string, page?: number, size?: number, sort?: any) => {
    loading.value = true
    try {
      const result = await getLedger(fromDate, toDate, page, size,sort)
      ledger.value = result.content
      totalRecords.value = result.totalElements
    } finally {
      loading.value = false
    }
  }

  return {
    ledger,
    selectedLedgerEntry,
    totalRecords,
    loadLedger,
    loading
  }

}
