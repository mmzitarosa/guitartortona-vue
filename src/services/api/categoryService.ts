import apiClient from '@/services/api/apiClient'
import type { Category } from '@/types/category'

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories')
  return data
}
