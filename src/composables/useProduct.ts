import { type Ref, ref } from 'vue'
import type { Bank } from '@/types/bank.ts'
import { getBanks } from '@/services/api/bankService.ts'
import { getProduct } from '@/services/api/productService.ts'

export const useProduct = () => {
  const item: Ref<T> = ref({ ...(initialItem ?? {}) })
  const loading = ref(false)

  const loadProduct = async (code: string) => {
    loading.value = true
    try {
      return await getProduct(code)
    } finally {
      loading.value = false
    }
  }

  return { loading, loadProduct }
}
