import { ref } from 'vue'
import { getProducts, type ProductsQuery } from '@/services/api/productService'
import type { ProductLight } from '@/types/product'

export const useProductsTable = () => {
  const products = ref<ProductLight[]>([])
  const totalRecords = ref(0)
  const loading = ref(false)
  // Evita che una risposta lenta sovrascriva quella di una ricerca più recente
  let requestId = 0

  const loadProducts = async (query: ProductsQuery) => {
    const current = ++requestId
    loading.value = true
    try {
      const result = await getProducts(query)
      if (current !== requestId) return
      products.value = result.content
      totalRecords.value = result.totalElements
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  return {
    products,
    totalRecords,
    loadProducts,
    loading,
  }
}
