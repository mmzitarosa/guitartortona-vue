import { ref } from 'vue'
import { getAllProducts } from '@/services/api/productService'
import type { ProductLight } from '@/types/product'

export const useProductsTable = () => {
  const products = ref<ProductLight[]>([])
  const loading = ref(false)

  const loadProducts = async () => {
    loading.value = true
    try {
      products.value = await getAllProducts()
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
