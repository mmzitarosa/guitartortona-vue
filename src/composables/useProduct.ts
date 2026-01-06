import {
  getProductDetail,
  getProductDetailByCode,
  printProductLabel,
  updateProduct
} from '@/services/api/productService'
import { useForm } from './useForm'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import type { Brand } from '@/types/brand'
import { useProductConstants } from '@/utils/i18nConstants'
import { formatCurrency } from '@/utils/currencyUtils'

export const useProduct = () => {
  const constants = useProductConstants()

  const fieldMappings = [
    { key: 'code', label: constants.code.label },
    { key: 'internalCode', label: constants.internalCode.label },
    {
      key: 'category',
      label: constants.category.label,
      labeler: (category: Category | undefined) => category?.name,
    },
    {
      key: 'brand',
      label: constants.brand.label,
      labeler: (brand: Brand | undefined) => brand?.name,
    },
    { key: 'description', label: constants.description.label },
    { key: 'stock', label: constants.quantity.label, defaultValue: true },
    {
      key: 'price',
      label: constants.price.label,
      labeler: formatCurrency,
    },
    { key: 'notes', label: constants.notes.label },
  ]

  const form = useForm<Product>({
    getById: getProductDetail,
    update: updateProduct,
    fieldMappings,
  })

  const loadProduct = async (code: string) => {
    form.withLoading(async (): Promise<Product | undefined> => {
      const result = await getProductDetailByCode(code)
      form.setItem(result)
      return result
    })
  }

  const handlePrint = (quantity: number) => {
    if (!form.item.value.internalCode) return
    printProductLabel(form.item.value.internalCode, quantity)
  }

  return {
    product: form.item,
    loading: form.loading,
    changes: form.changes,
    dirty: form.dirty,
    pristine: form.pristine,
    loadProductByCode: loadProduct,
    loadProduct: form.loadItem,
    validation: form.validation,
    handleSubmit: form.handleSubmit,
    handleReset: form.handleReset,
    handleClose: form.handleClose,
    handlePrint,
    constants,
  }
}
