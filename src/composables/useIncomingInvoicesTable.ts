import { computed, ref } from 'vue'
import { getIncomingInvoices } from '@/services/api/incomingInvoiceService'
import type { IncomingInvoiceLight } from '@/types/incomingInvoice.ts'

export const useIncomingInvoicesTable = () => {
  const incomingInvoices = ref<IncomingInvoiceLight[]>([])
  const loading = ref(false)

  const loadIncomingInvoices = async () => {
    loading.value = true
    try {
      incomingInvoices.value = await getIncomingInvoices()
    } finally {
      loading.value = false
    }
  }

  const totalDrafts = computed(() => incomingInvoices.value.filter(i => i.status === 'DRAFT').length)

  return {
    incomingInvoices,
    totalDrafts,
    loadIncomingInvoices,
    loading,
  }
}
