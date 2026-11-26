import { type MaybeRef, toValue } from 'vue'
import type { UsedReceiptProduct, UsedReceiptProductLight } from '@/types/usedReceiptProduct'
import type { Product, ProductLight } from '@/types/product'
import type { Brand } from '@/types/brand'
import type { Category } from '@/types/category'
import {
  addProductToUsedReceipt,
  deleteProductFromUsedReceipt,
  updateProductInUsedReceipt,
} from '@/services/api/usedReceiptService'
import { useForm } from '@/composables/useForm'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'
import { formatCurrency } from '@/utils/currencyUtils'
import { useErrorHandler } from '@/utils/errorHandler'
import { printProductLabel } from '@/services/api/productService'
import { useBrands } from './useBrands'
import { useCategories } from './useCategories'

export function useUsedReceiptProduct(usedReceiptId: MaybeRef<number | undefined>) {
  const { product: constants } = useUsedReceiptConstants()
  const { handleApiError } = useErrorHandler()

  const fieldMappings = [
    { key: 'product.internalCode', label: constants.internalCode.label },
    {
      key: 'product.category',
      label: constants.category.label,
      labeler: (category: Category | undefined) => category?.name,
      validator: (category?: Category) => {
        if (!category) return { message: constants.category.messages.required }
      },
    },
    {
      key: 'product.brand',
      label: constants.brand.label,
      labeler: (brand: Brand | undefined) => brand?.name,
      validator: (brand?: Brand) => {
        if (brand?.name && brand.name.length > 100)
          return { message: constants.brand.messages.invalid }
      },
    },
    {
      key: 'product.description',
      label: constants.description.label,
      validator: (description?: string) => {
        if (!description?.trim()) return { message: constants.description.messages.required }
        else if (description.length > 255)
          return { message: constants.description.messages.tooLong }
      },
    },
    { key: 'vat', label: constants.vat.label, labeler: (vat?: number) => `${vat ?? 0}%` },
    {
      key: 'purchasePrice',
      label: constants.purchasePrice.label,
      labeler: formatCurrency,
      validator: (price?: number) => {
        if (!price || price < 0) return { message: constants.purchasePrice.messages.invalid }
      },
    },
    {
      key: 'product.price',
      label: constants.price.label,
      labeler: formatCurrency,
      validator: (price?: number) => {
        if (price !== undefined && price !== null && price < 0)
          return { message: constants.price.messages.invalid }
      },
    },
    {
      key: 'product.notes',
      label: constants.notes.label,
      validator: (notes?: string) => {
        if (notes && notes.length > 255) return { message: constants.notes.messages.tooLong }
      },
    },
  ]

  const form = useForm<UsedReceiptProduct>({
    create: (item: UsedReceiptProduct) => addProductToUsedReceipt(toValue(usedReceiptId)!, item),
    update: (id: number, item: UsedReceiptProduct) =>
      updateProductInUsedReceipt(toValue(usedReceiptId)!, id, item),
    remove: (id: number) => deleteProductFromUsedReceipt(toValue(usedReceiptId)!, id),
    fieldMappings,
    group: 'productDifferences',
  })

  const { getBrand } = useBrands()
  const { getCategory } = useCategories()

  const setUsedReceiptProduct = (item: UsedReceiptProductLight | UsedReceiptProduct) => {
    const product = item.product as Product | ProductLight
    if (product && ('categoryId' in product || 'brandId' in product)) {
      // Dal dettaglio ricevuta arrivano solo gli id: ricostruisco categoria e marca
      const { categoryId, brandId } = product as ProductLight
      ;(item.product as Product).category = categoryId ? getCategory(categoryId) : undefined
      ;(item.product as Product).brand = brandId ? getBrand(brandId) : undefined
    }
    form.setItem(item)
  }

  const newProduct = () => setUsedReceiptProduct({ product: {}, vat: 0 })

  const handlePrint = () => {
    const internalCode = form.item.value.product?.internalCode
    if (internalCode) printProductLabel(internalCode, 1).catch(handleApiError)
  }

  return {
    usedReceiptProduct: form.item,
    loading: form.loading,
    validation: form.validation,
    changes: form.changes,
    dirty: form.dirty,
    pristine: form.pristine,
    existingItem: form.existingItem,
    resetOriginal: form.resetOriginal,
    newProduct,
    setUsedReceiptProduct,
    handleSubmit: form.handleSubmit,
    handleReset: form.handleReset,
    handleClose: form.handleClose,
    handleDelete: form.handleDelete,
    handlePrint,
  }
}
