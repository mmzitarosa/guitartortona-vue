import type { ValidationFormOptions } from '@/types/form'
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct.ts'
import { useForm } from '@/composables/useForm.ts'
import type { Product } from '@/types/product.ts'

interface IncomingInvoiceProductFormOptions extends ValidationFormOptions<IncomingInvoiceProduct> {
  invoiceId: number,
  initialItem?: IncomingInvoiceProduct,
  getById: (invoiceId: number, id: number) => Promise<IncomingInvoiceProduct>
  create: (invoiceId: number, item: IncomingInvoiceProduct) => Promise<IncomingInvoiceProduct>
  update: (invoiceId: number, id: number, item: IncomingInvoiceProduct) => Promise<IncomingInvoiceProduct>
  remove: (invoiceId: number, id: number) => Promise<void>
}

export function useIncomingInvoiceProduct(options: IncomingInvoiceProductFormOptions) {

  const { invoiceId, initialItem, getById, create, update, remove, fieldMappings } = options

  // Wrapper delle funzioni CRUD che aggiungono incomingInvoiceId come primo parametro
  const form = useForm<IncomingInvoiceProduct>({
    initialItem: initialItem,
    getById: (id: number) => getById(invoiceId, id),
    create: (item: IncomingInvoiceProduct) => create(invoiceId, item),
    update: (id: number, item: IncomingInvoiceProduct) => update(invoiceId, id, item),
    remove: (id: number) => remove(invoiceId, id),
    fieldMappings: fieldMappings,
    group: 'productDifferences'
  })

  const setProduct = (product?: Product) => {
    form.setOriginal({
      ...initialItem,
      product: { ...product ?? {} }
    } as IncomingInvoiceProduct)
  }

  return {
    ...form,
    setProduct
  }

}
