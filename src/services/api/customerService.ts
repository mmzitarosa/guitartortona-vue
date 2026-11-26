import apiClient from '@/services/api/apiClient'
import type { Customer } from '@/types/customer'

export async function getAllCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>('/customers')
  return data
}
