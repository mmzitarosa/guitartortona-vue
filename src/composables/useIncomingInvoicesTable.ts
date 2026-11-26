import { computed, ref } from 'vue'
import type { IncomingInvoiceLight } from '@/types/incomingInvoice'
import { useRoles } from '@/composables/useRoles'
import { getAllIncomingInvoices, getArchivedIncomingInvoices } from '@/services/api/incomingInvoiceService'

export const useIncomingInvoicesTable = () => {
  const incomingInvoices = ref<IncomingInvoiceLight[]>([])
  const archivedInvoices = ref<IncomingInvoiceLight[]>([])
  const loading = ref(false)
  const { isAdmin } = useRoles()

  const loadIncomingInvoices = async () => {
    loading.value = true
    try {
      // Le eliminate esistono solo per l'admin
      const [active, archived] = await Promise.all([
        getAllIncomingInvoices(),
        isAdmin ? getArchivedIncomingInvoices() : Promise.resolve([]),
      ])
      incomingInvoices.value = active
      archivedInvoices.value = archived
    } finally {
      loading.value = false
    }
  }

  const totalDrafts = computed(
    () => incomingInvoices.value.filter((i) => i.status === 'DRAFT').length,
  )

  const totalArchived = computed(() => archivedInvoices.value.length)

  return {
    incomingInvoices,
    archivedInvoices,
    totalArchived,
    totalDrafts,
    loadIncomingInvoices,
    loading,
  }
}
