import apiClient from '@/services/api/apiClient'
import { fetchPrintPageUrl } from '@/services/api/printService'
import type { UsedReceipt, UsedReceiptLight } from '@/types/usedReceipt'
import type { UsedReceiptProduct } from '@/types/usedReceiptProduct'
import { toCustomerDTO } from '@/types/customer'
import { formatDate, parseDate } from '@/utils/dateUtils'

const fromDTO = (dto: Omit<UsedReceipt, 'date'> & { date: string }): UsedReceipt => ({
  ...dto,
  date: parseDate(dto.date),
})

const toDTO = (receipt: UsedReceipt) => ({
  date: formatDate(receipt.date),
  notes: receipt.notes || undefined,
  customer: receipt.customer ? toCustomerDTO(receipt.customer) : undefined,
  updateCustomer: !!receipt.updateCustomer,
})

// Quantità (sempre 1), codice produttore e punto di riordino non esistono per l'usato
const productToDTO = (item: UsedReceiptProduct) => {
  const { id, category, brand, description, price, notes } = item.product ?? {}
  return {
    product: { id, category, brand, description, price, notes },
    vat: item.vat ?? 0,
    purchasePrice: item.purchasePrice,
  }
}

//Create
export async function createUsedReceipt(receipt: UsedReceipt): Promise<UsedReceipt> {
  const { data } = await apiClient.post('/usedReceipt', toDTO(receipt))
  return fromDTO(data)
}

//Read
export async function getAllUsedReceipts(): Promise<UsedReceiptLight[]> {
  const { data } = await apiClient.get<UsedReceiptLight[]>('/usedReceipts')
  return data
}

export async function getArchivedUsedReceipts(): Promise<UsedReceiptLight[]> {
  const { data } = await apiClient.get<UsedReceiptLight[]>('/archive/usedReceipts')
  return data
}

export async function getUsedReceiptDetail(id: number): Promise<UsedReceipt> {
  const { data } = await apiClient.get(`/usedReceipt/${id}`)
  return fromDTO(data)
}

export async function getUsedReceiptDetailByCode(code: string): Promise<UsedReceipt> {
  const { data } = await apiClient.get('/usedReceipt', { params: { code } })
  return fromDTO(data)
}

//Update
export async function updateUsedReceipt(id: number, receipt: UsedReceipt): Promise<UsedReceipt> {
  const { data } = await apiClient.put(`/usedReceipt/${id}`, toDTO(receipt))
  return fromDTO(data)
}

export async function confirmUsedReceipt(id: number): Promise<UsedReceipt> {
  const { data } = await apiClient.patch(`/usedReceipt/${id}/confirm`)
  return fromDTO(data)
}

export async function registerUsedReceipt(id: number): Promise<UsedReceipt> {
  const { data } = await apiClient.patch(`/usedReceipt/${id}/register`)
  return fromDTO(data)
}

export async function restoreUsedReceipt(id: number): Promise<UsedReceipt> {
  const { data } = await apiClient.patch(`/usedReceipt/${id}/restore`)
  return fromDTO(data)
}

//Archive (eliminazione apparente)
export async function archiveUsedReceipt(id: number): Promise<void> {
  await apiClient.patch(`/usedReceipt/${id}/archive`)
}

//Delete (fisica, solo admin e solo se già archiviata)
export async function deleteUsedReceipt(id: number): Promise<void> {
  await apiClient.delete(`/usedReceipt/${id}`)
}

//Print
export type UsedReceiptPrintMode = 'receipt' | 'labels'

// Blob URL del documento: va rilasciato con URL.revokeObjectURL
export function usedReceiptPrintUrl(id: number, mode: UsedReceiptPrintMode): Promise<string> {
  return fetchPrintPageUrl(`/usedReceipt/${id}/print`, { mode })
}

//Products
export async function addProductToUsedReceipt(
  receiptId: number,
  item: UsedReceiptProduct,
): Promise<UsedReceiptProduct> {
  const { data } = await apiClient.post<UsedReceiptProduct>(
    `/usedReceipt/${receiptId}/product`,
    productToDTO(item),
  )
  return data
}

export async function updateProductInUsedReceipt(
  receiptId: number,
  id: number,
  item: UsedReceiptProduct,
): Promise<UsedReceiptProduct> {
  const { data } = await apiClient.put<UsedReceiptProduct>(
    `/usedReceipt/${receiptId}/product/${id}`,
    productToDTO(item),
  )
  return data
}

export async function deleteProductFromUsedReceipt(receiptId: number, id: number): Promise<void> {
  await apiClient.delete(`/usedReceipt/${receiptId}/product/${id}`)
}
