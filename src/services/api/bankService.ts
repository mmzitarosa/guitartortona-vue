import apiClient from '@/services/api/apiClient.ts'
import type { Bank } from '@/types/bank.ts'

export async function getBanks(): Promise<Bank[]> {
  const {data} = await apiClient.get("/banks")
  return data
}
