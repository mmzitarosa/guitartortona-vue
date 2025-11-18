import { computed, type MaybeRef, toValue } from 'vue'
import type { IncomingInvoice } from '@/types/incomingInvoice'
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct'

export function useIncomingInvoiceProductsTable(invoice: MaybeRef<IncomingInvoice | undefined>) {
  const invoiceValue = computed(() => toValue(invoice))

  const products = computed(() => invoiceValue.value?.items ?? [])
  const hasProducts = computed(() => (products.value?.length ?? 0) > 0)

  const totalQuantity = computed(() => {
    return products.value?.reduce((acc, cur) => (cur.quantity ? acc + cur.quantity : acc), 0) ?? 0
  })

  const totalPurchasePrice = computed(() => {
    return (
      products.value?.reduce(
        (acc, cur) =>
          cur.purchasePrice && cur.quantity ? acc + cur.quantity * cur.purchasePrice : acc,
        0,
      ) ?? 0
    )
  })

  const totalAmount = computed(() => {
    return (
      products.value?.reduce(
        (acc, cur) =>
          cur.purchasePrice && cur.quantity && cur.vat
            ? acc + cur.quantity * cur.purchasePrice * (1 + cur.vat / 100)
            : acc,
        0,
      ) ?? 0
    )
  })

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  const totalQuantityFormatted = computed(() => totalQuantity.value.toString())

  const totalPurchasePriceFormatted = computed(() => formatCurrency(totalPurchasePrice.value))

  const totalAmountFormatted = computed(() => formatCurrency(totalAmount.value))

  const getProductAmount = (product: IncomingInvoiceProduct): number => {
    if (!product.quantity || !product.purchasePrice) return 0
    return product.quantity * product.purchasePrice
  }

  const formatProductAmount = (product: IncomingInvoiceProduct): string => {
    return formatCurrency(getProductAmount(product))
  }

  return {
    products,
    hasProducts,
    totalQuantity,
    totalQuantityFormatted,
    totalPurchasePrice,
    totalPurchasePriceFormatted,
    totalAmount,
    totalAmountFormatted,
    formatCurrency,
    getProductAmount,
    formatProductAmount,
  }
}
