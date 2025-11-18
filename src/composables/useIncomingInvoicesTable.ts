import { type Ref, ref } from 'vue'
import { getIncomingInvoices } from '@/services/api/incomingInvoiceService'

export const useIncomingInvoicesTable = () => {
  const incomingInvoices = ref([{}])
  const totalRecords = ref(0)
  const totalDrafts = ref(0)
  const loading = ref(false)

  const loadIncomingInvoices = async (
    page?: number,
    size?: number,
    sort?: any,
    status?: string,
  ) => {
    loading.value = true
    try {
      const result = await getIncomingInvoices(page, size, sort, status)
      incomingInvoices.value = result.content
      totalRecords.value = result.totalElements
      totalDrafts.value = result.totalDrafts
    } finally {
      loading.value = false
    }
  }

  return {
    incomingInvoices,
    totalRecords,
    totalDrafts,
    loadIncomingInvoices,
    loading,
  }
}
