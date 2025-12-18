import { computed, ref } from 'vue'
import type { LedgerEntryLight } from '@/types/ledgerEntry'
import { getLedger } from '@/services/api/ledgerService'

export const useLedgerTable = () => {
  const ledger = ref<LedgerEntryLight[]>([])
  const loading = ref(false)

  const loadLedger = async (year: number) => {
    loading.value = true
    try {
      ledger.value = await getLedger(year)
    } finally {
      loading.value = false
    }
  }

  const totalDrafts = computed(() => ledger.value.filter((i) => i.status === 'DRAFT').length)

  return {
    ledger,
    totalDrafts,
    loadLedger,
    loading,
  }
}
