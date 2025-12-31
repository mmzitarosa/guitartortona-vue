import apiClient from '@/services/api/apiClient'
import type { Supplier } from '@/types/supplier'

export async function getAllSuppliers(): Promise<Supplier[]> {
  const { data } = await apiClient.get<Supplier[]>('/suppliers')
  return data
}
