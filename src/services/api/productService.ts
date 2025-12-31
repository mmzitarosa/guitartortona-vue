import apiClient from '@/services/api/apiClient'
import type { Product, ProductLight } from '@/types/product'
import type { Sale } from '@/types/sale'
import { API_CONFIG } from '@/config/api'

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
  const { data } = await apiClient.put<Product>(`/product/${id}/sell`, sale)
  return data
}

export function printProductLabel(internalCode: string, quantity: number) {
  window.open(
    API_CONFIG.baseURL + '/api/v1/product/print?code=' + internalCode + '&quantity=' + quantity,
    '_blank',
  )
}
