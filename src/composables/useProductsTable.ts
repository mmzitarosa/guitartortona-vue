import { ref } from 'vue'
import { getProducts } from '@/services/api/productService.ts'
import type { ProductLight } from '@/types/product.ts'

export const useProductsTable = () => {
  const products = ref<ProductLight[]>([])
  const loading = ref(false)

  const loadProducts = async () => {
    loading.value = true
    try {
      products.value = await getProducts()
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loadProducts,
    loading,
  }
}
