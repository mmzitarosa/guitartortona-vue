import apiClient from '@/services/api/apiClient.ts'
import { fromDTO, toDTO } from '@/utils/mapper/incomingInvoiceMapper.ts'
import type { Supplier } from '@/types/supplier.ts'

export async function getSuppliers(): Promise<Supplier[]> {
  const {data} = await apiClient.get("/suppliers")
  return data
}
