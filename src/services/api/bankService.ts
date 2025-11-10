import apiClient from '@/services/api/apiClient.ts'
import type { Supplier } from '@/types/supplier.ts'

export async function getBanks(): Promise<Supplier[]> {
  const {data} = await apiClient.get("/banks")
  return data
}
