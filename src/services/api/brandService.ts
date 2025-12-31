import apiClient from '@/services/api/apiClient'
import type { Brand } from '@/types/brand'

export async function getAllBrands(): Promise<Brand[]> {
  const { data } = await apiClient.get<Brand[]>('/brands')
  return data
}
