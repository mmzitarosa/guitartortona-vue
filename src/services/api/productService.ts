import apiClient from '@/services/api/apiClient'
import type { Product, ProductLight } from '@/types/product'
import type { Sale } from '@/types/sale'
import type { ProductTimeline } from '@/types/productTimeline'
import { fetchPrintPageUrl, printPageInFrame } from '@/services/api/printService'
import { formatDate } from '@/utils/dateUtils'

//Read
export interface ProductsQuery {
  search?: string
  description?: string
  categoryId?: number
  brandId?: number
  condition?: 'NEW' | 'USED'
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

export async function getProductTimeline(id: number): Promise<ProductTimeline> {
  const { data } = await apiClient.get<ProductTimeline>(`/product/${id}/timeline`)
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

export async function addCartSale(
  date: Date | undefined,
  receiptNumber: string | undefined,
  items: { productId: number; quantity: number; vat: number; salePrice: number; notes?: string }[],
): Promise<void> {
  await apiClient.post('/sales', { date: formatDate(date), receiptNumber, items })
}

export function printProductLabel(internalCode: string, quantity: number): Promise<void> {
  return printPageInFrame('/product/print', { code: internalCode, quantity })
}

// Blob URL dell'anteprima etichetta: va rilasciato con URL.revokeObjectURL
export function productLabelUrl(internalCode: string, quantity: number): Promise<string> {
  return fetchPrintPageUrl('/product/print', { code: internalCode, quantity })
}
