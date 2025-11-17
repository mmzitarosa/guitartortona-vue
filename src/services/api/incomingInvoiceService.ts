import apiClient from '@/services/api/apiClient.ts'
import {
  fromDTO,
  fromDTOPage,
  fromProductDTO,
  toDTO,
  toProductDTO,
} from '@/utils/mapper/incomingInvoiceMapper.ts'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct.ts'
import { postProduct, putProductById } from '@/services/api/productService.ts'

//Create
export async function postIncomingInvoice(
  incomingInvoice: IncomingInvoice,
): Promise<IncomingInvoice> {
  const { data } = await apiClient.post('/incomingInvoice', toDTO(incomingInvoice))
  return fromDTO(data)
}

//Read
export async function getIncomingInvoiceById(id: number): Promise<IncomingInvoice> {
  const { data } = await apiClient.get(`/incomingInvoice/${id}`)
  return fromDTO(data)
}

export async function getIncomingInvoices(
  page?: number,
  size?: number,
  sort?: any,
  status?: string,
): Promise<{
  content: IncomingInvoice[]
  totalElements: number
  totalDrafts: number
}> {
  const { data } = await apiClient.get(`/incomingInvoices`, {
    params: { page, size, sort, status },
  })
  return fromDTOPage(data)
}

//Update
export async function putIncomingInvoiceById(
  id: number,
  incomingInvoice: IncomingInvoice,
): Promise<IncomingInvoice> {
  const { data } = await apiClient.put(`/incomingInvoice/${id}`, toDTO(incomingInvoice))
  return fromDTO(data)
}

//Detele
export async function deleteIncomingInvoiceById(id: number): Promise<void> {
  await apiClient.delete(`/incomingInvoice/${id}`)
}

//Complete
export async function completeIncomingInvoiceById(id: number): Promise<IncomingInvoice> {
  const { data } = await apiClient.patch(`/incomingInvoice/${id}/complete`)
  return fromDTO(data)
}

//Add Product
export async function postIncomingInvoiceProduct(
  invoiceId: number,
  incomingInvoiceProduct: IncomingInvoiceProduct,
): Promise<IncomingInvoiceProduct> {
  if (incomingInvoiceProduct.product && incomingInvoiceProduct.product?.id === undefined)
    incomingInvoiceProduct.product = await postProduct(incomingInvoiceProduct.product)
  const { data } = await apiClient.post(
    `/incomingInvoice/${invoiceId}/product`,
    toProductDTO(incomingInvoiceProduct),
  )
  return fromProductDTO(data)
}

//Get Product
export async function getIncomingInvoiceProductById(
  invoiceId: number,
  id: number,
): Promise<IncomingInvoiceProduct> {
  const { data } = await apiClient.get(`/incomingInvoice/${invoiceId}/product/${id}`)
  return fromProductDTO(data)
}

//Update Product
export async function putIncomingInvoiceProductById(
  invoiceId: number,
  id: number,
  incomingInvoiceProduct: IncomingInvoiceProduct,
): Promise<IncomingInvoiceProduct> {
  if (incomingInvoiceProduct.product)
    incomingInvoiceProduct.product = await putProductById(
      incomingInvoiceProduct.product.id!,
      incomingInvoiceProduct.product,
    )
  const { data } = await apiClient.put(
    `/incomingInvoice/${invoiceId}/product/${id}`,
    toProductDTO(incomingInvoiceProduct),
  )
  return fromProductDTO(data)
}

//Detele
export async function deleteIncomingInvoiceProductById(
  invoiceId: number,
  id: number,
): Promise<void> {
  await apiClient.delete(`/incomingInvoice/${invoiceId}/product/${id}`)
}
