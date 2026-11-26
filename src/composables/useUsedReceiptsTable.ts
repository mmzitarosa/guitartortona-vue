import { computed, ref } from 'vue'
import type { UsedReceiptLight } from '@/types/usedReceipt'
import { useRoles } from '@/composables/useRoles'
import { getAllUsedReceipts, getArchivedUsedReceipts } from '@/services/api/usedReceiptService'

export const useUsedReceiptsTable = () => {
  const usedReceipts = ref<UsedReceiptLight[]>([])
  const archivedReceipts = ref<UsedReceiptLight[]>([])
  const loading = ref(false)
  const { isAdmin } = useRoles()

  const loadUsedReceipts = async () => {
    loading.value = true
    try {
      // Le eliminate esistono solo per l'admin
      const [active, archived] = await Promise.all([
        getAllUsedReceipts(),
        isAdmin ? getArchivedUsedReceipts() : Promise.resolve([]),
      ])
      usedReceipts.value = active
      archivedReceipts.value = archived
    } finally {
      loading.value = false
    }
  }

  const totalDrafts = computed(() => usedReceipts.value.filter((r) => r.status === 'DRAFT').length)
  const totalArchived = computed(() => archivedReceipts.value.length)

  return {
    usedReceipts,
    archivedReceipts,
    totalArchived,
    totalDrafts,
    loadUsedReceipts,
    loading,
  }
}
