import apiClient from '@/services/api/apiClient.ts'
import { fromDTO, toDTO } from '@/utils/mapper/incomingInvoiceMapper.ts'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'

//Create
export async function postIncomingInvoice(incomingInvoice: IncomingInvoice): Promise<IncomingInvoice> {
  const {data} = await apiClient.post("/incomingInvoice", toDTO(incomingInvoice))
  return fromDTO(data)
}

//Read
export async function getIncomingInvoiceById(id: number): Promise<IncomingInvoice> {
  const {data} = await apiClient.get(`/incomingInvoice/${id}`)
  return fromDTO(data)
}

//Update
export async function putIncomingInvoiceById(id: number, incomingInvoice: IncomingInvoice): Promise<IncomingInvoice> {
  const {data} = await apiClient.put(`/incomingInvoice/${id}`, toDTO(incomingInvoice))
  return fromDTO(data)
}

//Detele
export async function deleteIncomingInvoiceById(id: number): Promise<void> {
  await apiClient.delete(`/incomingInvoice/${id}`)
}

