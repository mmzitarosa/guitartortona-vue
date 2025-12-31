import { ref } from 'vue'
import { getProductDetailByCode } from '@/services/api/productService'

export const useProduct = () => {
  const loading = ref(false)

  const loadProduct = async (code: string) => {
    loading.value = true
    try {
      return await getProductDetailByCode(code)
    } finally {
      loading.value = false
    }
  }

  return { loading, loadProduct }
}
