import { computed, type MaybeRef, toValue } from 'vue'
import type { Brand } from '@/types/brand'
import type { Category } from '@/types/category'
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct'
import type { Product } from '@/types/product'
import {
  deleteIncomingInvoiceProductById,
  getIncomingInvoiceProductById,
  postIncomingInvoiceProduct,
  putIncomingInvoiceProductById,
} from '@/services/api/incomingInvoiceService'
import { useForm } from '@/composables/useForm'
import { useIncomingInvoiceProductConstants } from '@/utils/i18nConstants'

export function useIncomingInvoiceProduct(incomingInvoiceId: MaybeRef<number | undefined>) {
  const constants = useIncomingInvoiceProductConstants()

  const initialValue = {
    quantity: 1,
    vat: 22,
  }

  // Crea un computed per l'id così è reattivo
  const invoiceId = computed(() => toValue(incomingInvoiceId))

  const form = useForm<IncomingInvoiceProduct>({
    initialValue,
    getById: (id: number) => getIncomingInvoiceProductById(invoiceId.value!, id),
    create: (item: IncomingInvoiceProduct) => postIncomingInvoiceProduct(invoiceId.value!, item),
    update: (id: number, item: IncomingInvoiceProduct) =>
      putIncomingInvoiceProductById(invoiceId.value!, id, item),
    remove: (id: number) => deleteIncomingInvoiceProductById(invoiceId.value!, id),
    fieldMappings: [
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
        labeler: (vat: number | undefined) => (vat ? vat + '%' : undefined),
        defaultValue: true,
      },
      {
        key: 'product.price',
        label: constants.price.label,
        labeler: (amount: number | undefined) =>
          amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
      },
      { key: 'quantity', label: constants.quantity.label, defaultValue: true },
      {
        key: 'purchasePrice',
        label: constants.purchasePrice.label,
        labeler: (amount: number | undefined) =>
          amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
      },
      { key: 'product.notes', label: constants.notes.label },
    ],
    group: 'productDifferences',
  })

  const setIncomingInvoiceProduct = (incomingInvoiceProduct: IncomingInvoiceProduct) => {
    console.log(incomingInvoiceProduct)

    form.setItem(incomingInvoiceProduct)
  }

  const setProduct = (product?: Product) => {
    form.setItem({
      ...initialValue,
      product: { ...(product ?? {}) },
    })
  }

  const closeProduct = () => {
    form.setItem({
      ...initialValue,
    })
  }

  return {
    ...form,
    setProduct,
    closeProduct,
    setIncomingInvoiceProduct,
    constants,
  }
}
