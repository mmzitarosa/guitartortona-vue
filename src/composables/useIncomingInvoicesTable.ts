import { computed, ref } from 'vue'
import type { IncomingInvoiceLight } from '@/types/incomingInvoice'
import { getAllIncomingInvoices } from '@/services/api/incomingInvoiceService'

export const useIncomingInvoicesTable = () => {
  const incomingInvoices = ref<IncomingInvoiceLight[]>([])
  const loading = ref(false)

  const loadIncomingInvoices = async () => {
    loading.value = true
    try {
      incomingInvoices.value = await getAllIncomingInvoices()
    } finally {
      loading.value = false
    }
  }

  const totalDrafts = computed(
    () => incomingInvoices.value.filter((i) => i.status === 'DRAFT').length,
  )

  return {
    incomingInvoices,
    totalDrafts,
    loadIncomingInvoices,
    loading,
  }
}
