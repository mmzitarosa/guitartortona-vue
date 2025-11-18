import { ref } from 'vue'
import { getProduct } from '@/services/api/productService'

export const useProduct = () => {
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
