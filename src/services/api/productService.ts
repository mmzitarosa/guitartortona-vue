import apiClient from '@/services/api/apiClient'
import type { Product, ProductLight } from '@/types/product'
import type { Sale } from '@/types/sale'
import { API_CONFIG } from '@/config/api'
import { formatDate } from '@/utils/dateUtils'

//Read
export async function getAllProducts(): Promise<ProductLight[]> {
  const { data } = await apiClient.get<ProductLight[]>(`/products`)
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

export function printProductLabel(internalCode: string, quantity: number) {
  window.open(productLabelUrl(internalCode, quantity), '_blank')
}

export function productLabelUrl(internalCode: string, quantity: number) {
  return API_CONFIG.baseURL + '/api/v1/product/print?code=' + internalCode + '&quantity=' + quantity
}
