import apiClient from '@/services/api/apiClient.ts'
import { fromDTO, toDTO } from '@/utils/mapper/incomingInvoiceMapper.ts'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'

export async function postIncomingInvoice(incomingInvoice: IncomingInvoice): Promise<IncomingInvoice> {
  const {data} = await apiClient.post("/incomingInvoice", toDTO(incomingInvoice))
  return fromDTO(data)
}

export async function getIncomingInvoiceById(id: number): Promise<IncomingInvoice> {
  const {data} = await apiClient.get(`/incomingInvoice/${id}`)
  return fromDTO(data)
}
