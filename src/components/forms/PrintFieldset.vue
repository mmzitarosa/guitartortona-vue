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
import { computed, ref } from 'vue'
import { useProductPrintConstants } from '@/utils/i18nConstants'
import type { Product } from '@/types/product'
import { productLabelUrl } from '@/services/api/productService'
import { Button, Fieldset } from 'primevue'
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

const url = computed(() => {
  if (!model.value.internalCode) return undefined
  return productLabelUrl(model.value.internalCode, 1)
})
</script>

<style lang="css">
.printFieldset .p-fieldset-content-container,
.printFieldset .p-fieldset-content {
  height: 100%;
}
</style>
