import { type Ref, ref } from 'vue'
import { type LedgerEntry } from '@/types/ledgerEntry.ts'
import { getLedger } from '@/services/api/ledgerService.ts'

export const useLedgerTable = () => {
  const ledger = ref([{}])
  const totalRecords = ref(0)
  const loading = ref(false)
  const selectedLedgerEntry: Ref<LedgerEntry | undefined> = ref(undefined)

  const loadLedger = async (
    fromDate?: string,
    toDate?: string,
    page?: number,
    size?: number,
    sort?: any,
  ) => {
    loading.value = true
    try {
      const result = await getLedger(fromDate, toDate, page, size, sort)
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
    loading,
  }
}
