<template>
  <Card>
    <template #title>{{ constants.table.title }}</template>
    <template #subtitle>{{ constants.table.subtitle }}</template>
    <template #content>
      <!-- Box per inserimento prodotto usato -->
      <div class="w-full flex items-center justify-center" v-if="editable">
        <UsedReceiptProductForm
          v-model="usedReceiptProduct"
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
          @new="newProduct"
          @print="handlePrint"
        />
      </div>

      <!-- Tabella con i prodotti inseriti -->
      <UsedReceiptProductsTable :receipt="model" @view="onViewProduct" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from 'primevue'
import UsedReceiptProductForm from '@/components/forms/usedreceipt/UsedReceiptProductForm.vue'
import UsedReceiptProductsTable from './UsedReceiptProductsTable.vue'
import {
  addProductToReceipt,
  removeProductFromReceipt,
  type UsedReceipt,
} from '@/types/usedReceipt'
import type { UsedReceiptProductLight } from '@/types/usedReceiptProduct'
import { useUsedReceiptProduct } from '@/composables/useUsedReceiptProduct'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'
import { useBrands } from '@/composables/useBrands'

interface UsedReceiptProductProps {
  editable?: boolean
}

const props = withDefaults(defineProps<UsedReceiptProductProps>(), {
  editable: false,
})

const model = defineModel<UsedReceipt>({ required: true })

const constants = useUsedReceiptConstants()

const {
  usedReceiptProduct,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  existingItem,
  resetOriginal,
  newProduct,
  setUsedReceiptProduct,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete,
  handlePrint,
} = useUsedReceiptProduct(computed(() => model.value.id))

const { ensureBrand } = useBrands()

const emit = defineEmits<{
  rowSelect: [id?: number, edit?: boolean]
  changed: []
}>()

const onSubmit = async () => {
  const result = await handleSubmit()
  if (result && result !== true) {
    await ensureBrand((result.product as { brandId?: number } | undefined)?.brandId)
    addProductToReceipt(model.value, result)
    resetOriginal()
    emit('changed')
  }
}

const onClose = async (): Promise<boolean> => {
  // undefined = l'utente ha rifiutato la conferma
  if (!(await handleClose())) return false
  resetOriginal()
  return true
}

const onReset = async () => {
  await handleReset()
}

const onDelete = async () => {
  if (!(await handleDelete())) return
  removeProductFromReceipt(model.value, usedReceiptProduct.value.id!)
  resetOriginal()
  emit('changed')
}

const onViewProduct = async (item: UsedReceiptProductLight) => {
  if (props.editable) {
    if (usedReceiptProduct.value.product && !(await onClose())) return
    setUsedReceiptProduct(item)
  } else emit('rowSelect', item.product?.id, false)
}
</script>
