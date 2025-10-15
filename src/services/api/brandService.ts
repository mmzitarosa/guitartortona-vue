import apiClient from '@/services/api/apiClient.ts'
import { fromDTO, toDTO } from '@/utils/mapper/incomingInvoiceMapper.ts'
import type { Brand } from '@/types/brand.ts'

export async function getBrands(): Promise<Brand[]> {
  const {data} = await apiClient.get("/brands")
  return data
}
