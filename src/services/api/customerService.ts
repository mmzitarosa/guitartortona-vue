import apiClient from '@/services/api/apiClient'
import { toCustomerDTO, type Customer } from '@/types/customer'

export async function getAllCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>('/customers')
  return data
}

export async function getArchivedCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>('/archive/customers')
  return data
}

export async function putCustomer(id: number, customer: Customer): Promise<Customer> {
  const { data } = await apiClient.put<Customer>(`/customer/${id}`, toCustomerDTO(customer))
  return data
}

export async function archiveCustomer(id: number): Promise<void> {
  await apiClient.patch(`/customer/${id}/archive`)
}

export async function restoreCustomer(id: number): Promise<Customer> {
  const { data } = await apiClient.patch<Customer>(`/customer/${id}/restore`)
  return data
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/customer/${id}`)
}
