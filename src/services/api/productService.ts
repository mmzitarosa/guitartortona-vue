import apiClient from '@/services/api/apiClient.ts'
import { fromDTO, fromDTOPage, toDTO } from '@/utils/mapper/productMapper.ts'
import type { Product } from '@/types/product.ts'

//Create
export async function postProduct(product: Product): Promise<Product> {
  const {data} = await apiClient.post("/product", toDTO(product))
  return fromDTO(data)
}

//Read
export async function getProduct(code: string): Promise<Product | undefined> {
  const { data } = await apiClient.get(`/product`, { params: { code } })
  return fromDTO(data)
}

export async function getProducts(
  page?: number,
  size?: number,
  sort?: any,
  categoryId?: number,
  brandId?: number,
  description?: string,
): Promise<{
  content: Product[]
  totalElements: number
  totalDrafts: number
}> {
  const { data } = await apiClient.get(`/products`, {
    params: { page, size, sort, category: categoryId, brand: brandId, description },
  })
  return fromDTOPage(data)
}


//Update
export async function putProductById(id: number, product: Product): Promise<Product> {
  const {data} = await apiClient.put(`/product/${id}`, toDTO(product))
  return fromDTO(data)
}

//Detele
export async function deleteProductById(id: number): Promise<void> {
  await apiClient.delete(`/product/${id}`)
}
