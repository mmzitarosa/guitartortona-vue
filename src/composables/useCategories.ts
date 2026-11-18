import { computed, onMounted, ref } from 'vue'
import type { Category } from '@/types/category'
import { getAllCategories } from '@/services/api/categoryService'

export const useCategories = () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  onMounted(() => loadCategories())

  const loadCategories = async () => {
    loading.value = true
    try {
      categories.value = await getAllCategories()
    } finally {
      loading.value = false
    }
  }

  const allCategories = computed(() => {
    return getCategories([], categories.value) ?? []
  })

  const getCategories = (list: Category[], categories?: Category[]) => {
    if (!categories) return
    categories?.forEach((category) => {
      list.push(category)
      getCategories(list, category.subCategories)
    })
    return list
  }

  const map = computed(() => {
    const map = new Map<number, Category>()
    allCategories.value.forEach((category) => {
      if (category.id) map.set(category.id, category)
    })
    return map
  })

  const depthMap = computed(() => {
    const depths = new Map<number, number>()
    const visit = (list: Category[] | undefined, depth: number) => {
      list?.forEach((category) => {
        if (category.id) depths.set(category.id, depth)
        visit(category.subCategories, depth + 1)
      })
    }
    visit(categories.value, 0)
    return depths
  })

  const getCategoryDepth = (category: Category): number =>
    category.id ? (depthMap.value.get(category.id) ?? 0) : 0

  const getCategory = (categoryId?: number): Category | undefined => {
    return categoryId ? map.value.get(categoryId) : undefined
  }

  return { categories: allCategories, loading, getCategory, getCategoryDepth }
}
