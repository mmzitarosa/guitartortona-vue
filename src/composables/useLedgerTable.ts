import { computed, ref } from 'vue'
import type { LedgerEntryLight } from '@/types/ledgerEntry'
import { getArchivedLedger, getLedger } from '@/services/api/ledgerService'
import { useRoles } from '@/composables/useRoles'

export const useLedgerTable = () => {
  const ledger = ref<LedgerEntryLight[]>([])
  const archivedLedger = ref<LedgerEntryLight[]>([])
  const loading = ref(false)
  const { isAdmin } = useRoles()

  const loadLedger = async (year: number) => {
    loading.value = true
    try {
      // Le righe eliminate esistono solo per l'admin
      const [active, archived] = await Promise.all([
        getLedger(year),
        isAdmin ? getArchivedLedger(year) : Promise.resolve([]),
      ])
      ledger.value = active
      archivedLedger.value = archived
    } finally {
      loading.value = false
    }
  }

  const totalArchived = computed(() => archivedLedger.value.length)
  const totalPending = computed(() => ledger.value.filter((e) => e.status === 'PENDING').length)

  return {
    ledger,
    archivedLedger,
    totalArchived,
    totalPending,
    loadLedger,
    loading,
  }
}
