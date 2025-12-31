import apiClient from '@/services/api/apiClient'
import type { Bank } from '@/types/bank'

export async function getAllBanks(): Promise<Bank[]> {
  const { data } = await apiClient.get<Bank[]>('/banks')
  return data
}
