import { ref } from 'vue'
import type { Category } from '@/types/category'
import { getCategories } from '@/services/api/categoryService'

export const useCategories = () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  const loadCategories = async () => {
    loading.value = true
    try {
      categories.value = await getCategories()
    } finally {
      loading.value = false
    }
  }

  return { categories, loading, loadCategories }
}
