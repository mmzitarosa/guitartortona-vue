<template>
  <div class="pt-3">
    <div class="grid gap-4">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
        <InputTextField
          :modelValue="String(stock ?? 0)"
          inputId="currentStock"
          :label="constants.currentStock.label"
          readonly
        />
        <InputNumberField
          v-model="model.countedStock"
          inputId="countedStock"
          :label="constants.countedStock.label"
          :validation="validation?.fields.countedStock"
          showButtons
          buttonLayout="horizontal"
          :min="0"
        />
        <InputTextField
          :modelValue="difference"
          inputId="difference"
          :label="constants.difference.label"
          readonly
        />
      </div>

      <TextAreaField
        v-model="model.reason"
        inputId="reason"
        :rows="2"
        :label="constants.reason.label"
        :validation="validation?.fields.reason"
      />

      <div class="flex justify-between items-center w-full mt-2">
        <div class="flex gap-2">
          <Button
            v-if="dirty"
            type="button"
            :icon="constants.reset.icon"
            severity="secondary"
            variant="text"
            rounded
            :aria-label="constants.reset.label"
            v-tooltip.top="constants.reset.label"
            @click="emit('reset')"
          />
        </div>
        <div class="flex items-center gap-2">
          <Button
            v-if="dirty"
            type="button"
            :label="constants.confirm.label"
            :icon="constants.confirm.icon"
            :loading
            @click="emit('submit')"
          />
        </div>
      </div>
    </div>
  </div>
  <ChangesDialog :changes="changes ?? []" group="stockAdjustmentDifferences"></ChangesDialog>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
import { computed } from 'vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import InputNumberField from '@/components/layout/fields/InputNumberField.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import type { FieldChange } from '@/composables/useOriginalData'
import type { StockAdjustment } from '@/types/stockAdjustment'
import { useStockAdjustmentConstants } from '@/utils/i18nConstants'

interface FieldValidation {
  message?: string
  validate: boolean
  _valid: boolean
  valid: boolean
}

interface StockAdjustmentFormProps {
  loading?: boolean
  validation?: { fields: Record<string, FieldValidation> }
  changes?: FieldChange[]
  dirty?: boolean
  stock?: number
}

const props = withDefaults(defineProps<StockAdjustmentFormProps>(), { loading: false })

const emit = defineEmits<{
  submit: []
  reset: []
}>()

const constants = useStockAdjustmentConstants()
const model = defineModel<StockAdjustment>({ required: true })

// Differenza con segno tra quantità contata e giacenza attuale
const difference = computed(() => {
  if (model.value.countedStock == null) return ''
  const diff = model.value.countedStock - (props.stock ?? 0)
  return diff > 0 ? `+${diff}` : String(diff)
})
</script>
