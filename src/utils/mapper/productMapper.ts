
// Domain → DTO
import type { Product, ProductDTO } from '@/types/product.ts'

export function toDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    code: product.code,
    internalCode: product.internalCode,
    category: product.category,
    categoryId: product.category?.id,
    brand: product.brand,
    brandId: product.brand?.id,
    brandName: product.brand?.name,
    description: product.description,
    condition: product.condition,
    price: product.price,
    reorderPoint: product.reorderPoint,
    notes: product.notes,
  }
}

// DTO → Domain
export function fromDTO(dto: ProductDTO): Product {
  return {
    id: dto.id,
    code: dto.code,
    internalCode: dto.internalCode,
    category: dto.category,
    brand: dto.brand,
    description: dto.description,
    condition: dto.condition,
    price: dto.price,
    reorderPoint: dto.reorderPoint,
    notes: dto.notes,
  }
}
