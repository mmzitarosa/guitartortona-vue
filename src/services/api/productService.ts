import apiClient from '@/services/api/apiClient.ts'
import { fromDTO, toDTO, fromLightDTO } from '@/utils/mapper/productMapper.ts'
import type { Product, ProductDTO, ProductLight } from '@/types/product.ts'

//Create
export async function postProduct(product: Product): Promise<Product> {
  const { data } = await apiClient.post('/product', toDTO(product))
  return fromDTO(data)
}

//Read
export async function getProduct(code: string): Promise<Product | undefined> {
  const { data } = await apiClient.get(`/product`, { params: { code } })
  return fromDTO(data)
}

export async function getProducts(): Promise<ProductLight[]> {
  const { data } = await apiClient.get(`/products`)
  return data.flatMap((dto: ProductDTO) => fromLightDTO(dto))
}

//Update
export async function putProductById(id: number, product: Product): Promise<Product> {
  const { data } = await apiClient.put(`/product/${id}`, toDTO(product))
  return fromDTO(data)
}

//Detele
export async function deleteProductById(id: number): Promise<void> {
  await apiClient.delete(`/product/${id}`)
}
