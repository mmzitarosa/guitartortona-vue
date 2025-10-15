import apiClient from '@/services/api/apiClient.ts'
import type { Category } from '@/types/category.ts'

export async function getCategories(): Promise<Category[]> {
  const {data} = await apiClient.get("/categories")
  return data
}
