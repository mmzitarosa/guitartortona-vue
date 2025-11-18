<template>
  <Card>
    <template #title>{{ constants.table.title }}</template>
    <template #subtitle>{{ constants.table.subtitle }}</template>
    <template #content>
      <!-- Box per inserimento o scan codice a barre -->
      <div class="w-full flex items-center justify-center" v-if="editable">
        <IncomingInvoiceProductForm
          v-model="incomingInvoiceProduct"
          :editable
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
        />
      </div>

      <!-- Tabella con i prodotti inseriti -->
      <IncomingInvoiceProductsTable
        :invoice="model"
        :editable
        @edit="onEditProduct"
        @view="onViewProduct"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card } from 'primevue'
import IncomingInvoiceProductForm from '@/components/forms/incomininvoice/IncomingInvoiceProductForm.vue'
import IncomingInvoiceProductsTable from './IncomingInvoiceProductsTable.vue'
import { computed } from 'vue'
import {
  addProductToInvoice,
  removeProductFromInvoice,
  type IncomingInvoice,
} from '@/types/incomingInvoice'
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct'
import { useIncomingInvoiceProduct } from '@/composables/useIncomingInvoiceProduct'
import { useIncomingInvoiceProductsTableConstants } from '@/utils/i18nConstants'
import { getProduct } from '@/services/api/productService'

interface IncomingInvoiceProductProps {
  editable?: boolean
}

withDefaults(defineProps<IncomingInvoiceProductProps>(), {
  editable: false,
})

const model = defineModel<IncomingInvoice>({ required: true })

const constants = useIncomingInvoiceProductsTableConstants()

const {
  item: incomingInvoiceProduct,
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
  setProduct,
  closeProduct,
} = useIncomingInvoiceProduct(computed(() => model.value.id))

const onSearch = async (value?: string) => {
  if (value === undefined) return setProduct({})
  try {
    setProduct(await getProduct(value))
  } catch {
    setProduct({ code: value })
  }
}

const onSubmit = async () => {
  const result = await handleSubmit()
  if (result) {
    addProductToInvoice(model.value, result)
    closeProduct()
  }
}

const onClose = async () => {
  await handleClose()
  closeProduct()
}

const onReset = async () => {
  await handleReset()
}

const onDelete = async () => {
  await handleDelete()
  removeProductFromInvoice(model.value, incomingInvoiceProduct.value.id!)
  closeProduct()
}

const onEditProduct = (product: IncomingInvoiceProduct) => {
  setIncomingInvoiceProduct(product)
}

const onViewProduct = (product: IncomingInvoiceProduct) => {
  // TODO: Implementare visualizzazione dettaglio prodotto
  console.log('View product:', product)
}
</script>
