<template>
  <Fieldset :legend="constants.fieldset.legend" class="printFieldset">
    <div class="flex flex-col h-full">
      <div class="flex flex-1 items-center justify-center m-6">
        <ScaledLabel v-if="url" :labelUrl="url" :width="587" :height="230" :maxWidth="400" />
      </div>
      <div class="flex flex-row-reverse justify-between items-center w-full mt-2">
        <div class="flex gap-2">
          <!-- Tasto Stampa e Vendita - Visualizzazione  -->
          <InputNumberField
            v-model="quantity"
            inputId="quantity"
            :label="constants.quantity.label"
            class="w-40 ml-4"
            showButtons
            buttonLayout="horizontal"
            :min="1"
          />
          <Button
            type="button"
            :icon="constants.print.icon"
            severity="secondary"
            :label="constants.print.label"
            @click="emit('print', quantity)"
          />
        </div>
      </div>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useProductPrintConstants } from '@/utils/i18nConstants'
import type { Product } from '@/types/product'
import { productLabelUrl } from '@/services/api/productService'
import { Button, Fieldset } from 'primevue'
import { useErrorHandler } from '@/utils/errorHandler'
import ScaledLabel from '../layout/ScaledLabel.vue'
import InputNumberField from '../layout/fields/InputNumberField.vue'

const constants = useProductPrintConstants()

interface ValidationResult {
  fields: Record<string, { message?: string; validate: boolean; _valid: boolean; valid: boolean }>
  validate: boolean
  _valid: boolean
  valid: boolean
}

interface SaleFormProps {
  loading?: boolean
  validation?: ValidationResult
}

const quantity = ref(1)

const props = withDefaults(defineProps<SaleFormProps>(), {
  loading: false,
})

const emit = defineEmits<{
  print: [quantity: number]
}>()

const model = defineModel<Product>({ required: true })

const { handleApiError } = useErrorHandler()

// L'anteprima e' scaricata con il token e mostrata tramite Blob URL
const url = ref<string>()

const releaseUrl = () => {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = undefined
}

watch(
  () => model.value.internalCode,
  async (internalCode) => {
    releaseUrl()
    if (!internalCode) return
    try {
      const labelUrl = await productLabelUrl(internalCode, 1)
      if (internalCode === model.value.internalCode) url.value = labelUrl
      else URL.revokeObjectURL(labelUrl)
    } catch (error) {
      handleApiError(error)
    }
  },
  { immediate: true },
)

onBeforeUnmount(releaseUrl)
</script>

<style lang="css">
.printFieldset .p-fieldset-content-container,
.printFieldset .p-fieldset-content {
  height: 100%;
}
</style>
