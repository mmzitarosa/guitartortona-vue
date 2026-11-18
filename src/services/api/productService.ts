import apiClient from '@/services/api/apiClient'
import type { Product, ProductLight } from '@/types/product'
import type { Sale } from '@/types/sale'
import { fetchPrintPageUrl, openPrintPage } from '@/services/api/printService'
import { formatDate } from '@/utils/dateUtils'

//Read
export interface ProductsQuery {
  search?: string
  description?: string
  categoryId?: number
  brandId?: number
  available?: boolean
  page: number
  size: number
}

export interface Page<T> {
  content: T[]
  totalElements: number
  page: number
  size: number
}

export async function getProducts(query: ProductsQuery): Promise<Page<ProductLight>> {
  const { data } = await apiClient.get<Page<ProductLight>>(`/products`, { params: query })
  return data
}

export async function getProductDetail(id: number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/product/${id}`)
  return data
}

export async function getProductDetailByCode(code: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/product`, { params: { code } })
  return data
}

//Update
export async function updateProduct(id: number, product: Product): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/product/${id}`, product)
  return data
}

//Others
//Sell
export async function addProductSale(id: number, sale: Sale): Promise<Product> {
  const { data } = await apiClient.post<Product>(`/product/${id}/sell`, {
    ...sale,
    date: formatDate(sale.date),
  })
  return data
}

export function printProductLabel(internalCode: string, quantity: number): Promise<void> {
  return openPrintPage('/product/print', { code: internalCode, quantity })
}

// Blob URL dell'anteprima etichetta: va rilasciato con URL.revokeObjectURL
export function productLabelUrl(internalCode: string, quantity: number): Promise<string> {
  return fetchPrintPageUrl('/product/print', { code: internalCode, quantity })
}
