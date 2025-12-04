import { ref } from 'vue'
import { getProduct, getProducts } from '@/services/api/productService.ts'

export const useProductsTable = () => {
  const products = ref([{}])
  const totalRecords = ref(0)
  const totalDrafts = ref(0)
  const loading = ref(false)

  const loadProducts = async (
    page?: number,
    size?: number,
    sort?: any,
    categoryId?: number,
    brandId?: number,
    description?: string,
  ) => {
    loading.value = true
    try {
      const result = await getProducts(page, size, sort, categoryId, brandId, description)
      products.value = result.content
      totalRecords.value = result.totalElements
      totalDrafts.value = result.totalDrafts
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    totalRecords,
    totalDrafts,
    loadProducts,
    loading,
  }
}
