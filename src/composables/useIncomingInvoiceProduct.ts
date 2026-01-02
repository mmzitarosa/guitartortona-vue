import { type MaybeRef, toValue } from 'vue'
import type {
  IncomingInvoiceProduct,
  IncomingInvoiceProductLight
} from '@/types/incomingInvoiceProduct'
import type { Product, ProductLight } from '@/types/product'
import type { Brand } from '@/types/brand'
import type { Category } from '@/types/category'
import {
  addProductToIncomingInvoice,
  deleteProductFromIncomingInvoice,
  updateProductInIncomingInvoice
} from '@/services/api/incomingInvoiceService'
import { useForm } from '@/composables/useForm'
import { useIncomingInvoiceProductConstants } from '@/utils/i18nConstants'
import { formatCurrency } from '@/utils/currencyUtils'
import { printProductLabel } from '@/services/api/productService'
import { useBrands } from './useBrands'
import { useCategories } from './useCategories'

export function useIncomingInvoiceProduct(incomingInvoiceId: MaybeRef<number | undefined>) {
  const constants = useIncomingInvoiceProductConstants()

  const initialValue = {
    quantity: 1,
    vat: 22,
  }

  const fieldMappings = [
    { key: 'product.code', label: constants.code.label },
    { key: 'product.internalCode', label: constants.internalCode.label },
    {
      key: 'product.category',
      label: constants.category.label,
      labeler: (category: Category | undefined) => category?.name,
    },
    {
      key: 'product.brand',
      label: constants.brand.label,
      labeler: (brand: Brand | undefined) => brand?.name,
    },
    { key: 'product.description', label: constants.description.label },
    {
      key: 'vat',
      label: constants.vat.label,
      labeler: (vat: number | undefined) => (vat ? `${vat}%` : undefined),
      defaultValue: true,
    },
    {
      key: 'product.price',
      label: constants.price.label,
      labeler: formatCurrency,
    },
    { key: 'quantity', label: constants.quantity.label, defaultValue: true },
    {
      key: 'purchasePrice',
      label: constants.purchasePrice.label,
      labeler: formatCurrency,
    },
    { key: 'product.notes', label: constants.notes.label },
  ]

  const form = useForm<IncomingInvoiceProduct>({
    initialValue,
    create: (item: IncomingInvoiceProduct) =>
      addProductToIncomingInvoice(toValue(incomingInvoiceId)!, item),
    update: (id: number, item: IncomingInvoiceProduct) =>
      updateProductInIncomingInvoice(toValue(incomingInvoiceId)!, id, item),
    remove: (id: number) => deleteProductFromIncomingInvoice(toValue(incomingInvoiceId)!, id),
    fieldMappings,
    group: 'productDifferences',
  })

  const { getBrand } = useBrands()
  const { getCategory } = useCategories()

  const setIncomingInvoiceProduct = (
    incomingInvoiceProduct: IncomingInvoiceProductLight | IncomingInvoiceProduct,
  ) => {
    const product = incomingInvoiceProduct.product as Product | ProductLight
    if (product && ('categoryId' in product || 'brandId' in product)) {
      // Convert IncomingInvoiceProductLight a IncomingInvoiceProduct, aggiungendo category e brand come oggetti
      const { categoryId, brandId } = product as ProductLight

      ;(incomingInvoiceProduct.product as Product).category = categoryId
        ? getCategory(brandId)
        : undefined
      ;(incomingInvoiceProduct.product as Product).brand = brandId ? getBrand(brandId) : undefined
    }
    form.setItem(incomingInvoiceProduct)
  }

  const setProduct = (product?: Product) => {
    setIncomingInvoiceProduct({ ...initialValue, product: { ...(product ?? {}) } })
  }

  const handlePrint = (quantity: number) => {
    if (!form.item.value.product?.internalCode) return
    printProductLabel(form.item.value.product.internalCode, quantity)
  }

  const resetOriginal = () => {
    return form.resetOriginal()
  }

  return {
    incomingInvoiceProduct: form.item,
    loading: form.loading,
    validation: form.validation,
    changes: form.changes,
    dirty: form.dirty,
    pristine: form.pristine,
    existingItem: form.existingItem,
    resetOriginal,
    setProduct,
    setIncomingInvoiceProduct,
    handleSubmit: form.handleSubmit,
    handleReset: form.handleReset,
    handleClose: form.handleClose,
    handleDelete: form.handleDelete,
    handlePrint,
    constants,
  }
}
