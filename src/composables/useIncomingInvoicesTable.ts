import { ref } from 'vue'
import { getIncomingInvoices } from '@/services/api/incomingInvoiceService.ts'

export const useIncomingInvoicesTable = () => {
  const incomingInvoices = ref([{}])
  const totalRecords = ref(0)
  const loading = ref(false)

  const loadIncomingInvoices = async (
    page?: number,
    size?: number,
    sort?: any,
  ) => {
    loading.value = true
    try {
      const result = await getIncomingInvoices(page, size, sort)
      incomingInvoices.value = result.content
      totalRecords.value = result.totalElements
    } finally {
      loading.value = false
    }
  }

  return {
    incomingInvoices,
    totalRecords,
    loadIncomingInvoices,
    loading,
  }
}
