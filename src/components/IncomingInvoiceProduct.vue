<template>
  <Card>
    <template #title>{{ constants.table.title }}</template>
    <template #subtitle>{{ constants.table.subtitle }}</template>
    <template #content>
      <!-- Box per inserimento o scan codice a barre -->
      <div class="w-full flex items-center justify-center" v-if="editable">
        <IncomingInvoiceProductForm
          v-model="incomingInvoiceProduct"
          :loading
          :validation
          :changes
          :dirty
          :pristine
          :existingItem
          @submit="onSubmit"
          @close="onClose"
          @delete="onDelete"
          @reset="onReset"
          @search="onSearch"
          @print="onPrint"
        />
      </div>

      <!-- Tabella con i prodotti inseriti -->
      <IncomingInvoiceProductsTable :invoice="model" :editable @view="onViewProduct" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card } from 'primevue'
import IncomingInvoiceProductForm from '@/components/forms/incomininvoice/IncomingInvoiceProductForm.vue'
import IncomingInvoiceProductsTable from './IncomingInvoiceProductsTable.vue'
import {
  addProductToInvoice,
  type IncomingInvoice,
  removeProductFromInvoice,
} from '@/types/incomingInvoice'
import type { IncomingInvoiceProductLight } from '@/types/incomingInvoiceProduct'
import { useIncomingInvoiceProduct } from '@/composables/useIncomingInvoiceProduct'
import { useIncomingInvoiceProductsTableConstants } from '@/utils/i18nConstants'
import { getProductDetailByCode } from '@/services/api/productService'
import { computed } from 'vue'

interface IncomingInvoiceProductProps {
  editable?: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceProductProps>(), {
  editable: false,
})

const model = defineModel<IncomingInvoice>({ required: true })

const constants = useIncomingInvoiceProductsTableConstants()

const {
  incomingInvoiceProduct,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  existingItem,
  setIncomingInvoiceProduct,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete,
  handlePrint,
  setProduct,
  resetOriginal,
} = useIncomingInvoiceProduct(computed(() => model.value.id))

const emit = defineEmits<{
  rowSelect: [id?: number, edit?: boolean]
}>()

const onSearch = async (value?: string) => {
  if (value === undefined) return setProduct({})
  try {
    setProduct(await getProductDetailByCode(value))
  } catch {
    setProduct({ code: value })
  }
}

const onSubmit = async () => {
  const result = await handleSubmit()
  if (result) {
    addProductToInvoice(model.value, result)
    //resetOriginal()
  }
}

const onClose = async () => {
  await handleClose()
  resetOriginal()
}

const onReset = async () => {
  await handleReset()
}

const onDelete = async () => {
  await handleDelete()
  removeProductFromInvoice(model.value, incomingInvoiceProduct.value.id!)
  resetOriginal()
}

const onViewProduct = async (product: IncomingInvoiceProductLight) => {
  if (props.editable) {
    if (incomingInvoiceProduct.value.product) await onClose()
    setIncomingInvoiceProduct(product)
  } else emit('rowSelect', product.product?.id, false)
}

const onPrint = (quantity: number) => {
  handlePrint(quantity)
}
</script>
