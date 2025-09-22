import { ref } from 'vue'
import type { Bank } from '@/types/bank.ts'
import { getBanks } from '@/services/api/bankService.ts'

export const useBanks = () => {
  const banks = ref<Bank[]>([])
  const loading = ref(false)

  const loadBanks = async () => {
    loading.value = true
    try {
      banks.value = await getBanks()
    } finally {
      loading.value = false
    }
  }

  return { banks, loading, loadBanks }
}
