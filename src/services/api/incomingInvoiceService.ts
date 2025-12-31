import apiClient from '@/services/api/apiClient'
import type { IncomingInvoice, IncomingInvoiceLight } from '@/types/incomingInvoice'
import type { IncomingInvoiceProduct } from '@/types/incomingInvoiceProduct'
import { formatDate } from '@/utils/dateUtils'

//Create
export async function createIncomingInvoice(
  incomingInvoice: IncomingInvoice,
): Promise<IncomingInvoice> {
  const { data } = await apiClient.post<IncomingInvoice>('/incomingInvoice', {
    ...incomingInvoice,
    date: formatDate(incomingInvoice.date),
  })
  return data
}

//Read
export async function getAllIncomingInvoices(): Promise<IncomingInvoiceLight[]> {
  const { data } = await apiClient.get<IncomingInvoiceLight[]>(`/incomingInvoices`)
  return data
}

export async function getArchivedIncomingInvoices(): Promise<IncomingInvoiceLight[]> {
  const { data } = await apiClient.get<IncomingInvoiceLight[]>(`/archive/incomingInvoices`)
  return data
}

export async function getIncomingInvoiceDetail(id: number): Promise<IncomingInvoice> {
  const { data } = await apiClient.get<IncomingInvoice>(`/incomingInvoice/${id}`)
  return data
}

//Update
export async function updateIncomingInvoice(
  id: number,
  incomingInvoice: IncomingInvoice,
): Promise<IncomingInvoice> {
  const { data } = await apiClient.put<IncomingInvoice>(`/incomingInvoice/${id}`, incomingInvoice)
  return data
}

export async function completeIncomingInvoice(id: number): Promise<IncomingInvoice> {
  const { data } = await apiClient.patch<IncomingInvoice>(`/incomingInvoice/${id}/complete`)
  return data
}

export async function restoreIncomingInvoice(id: number): Promise<IncomingInvoice> {
  const { data } = await apiClient.patch<IncomingInvoice>(`/incomingInvoice/${id}/restore`)
  return data
}

//Delete
export async function deleteIncomingInvoice(id: number): Promise<void> {
  await apiClient.delete(`/incomingInvoice/${id}`)
}

//Others
//Create
export async function addProductToIncomingInvoice(
  invoiceId: number,
  incomingInvoiceProduct: IncomingInvoiceProduct,
): Promise<IncomingInvoice> {
  const { data } = await apiClient.post<IncomingInvoice>(
    `/incomingInvoice/${invoiceId}/product`,
    incomingInvoiceProduct,
  )
  return data
}

//Update
export async function updateProductInIncomingInvoice(
  invoiceId: number,
  id: number,
  incomingInvoiceProduct: IncomingInvoiceProduct,
): Promise<IncomingInvoice> {
  const { data } = await apiClient.put<IncomingInvoice>(
    `/incomingInvoice/${invoiceId}/product/${id}`,
    incomingInvoiceProduct,
  )
  return data
}

//Delete
export async function deleteProductFromIncomingInvoice(
  invoiceId: number,
  id: number,
): Promise<void> {
  await apiClient.delete(`/incomingInvoice/${invoiceId}/product/${id}`)
}
