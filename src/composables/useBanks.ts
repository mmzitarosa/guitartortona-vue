import { ref } from 'vue'
import type { Bank } from '@/types/bank'
import { getAllBanks } from '@/services/api/bankService'

export const useBanks = () => {
  const banks = ref<Bank[]>([])
  const loading = ref(false)

  const loadBanks = async () => {
    loading.value = true
    try {
      banks.value = await getAllBanks()
    } finally {
      loading.value = false
    }
  }

  return { banks, loading, loadBanks }
}
