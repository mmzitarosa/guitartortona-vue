<template>
  <div class="pt-3">
    <div>
      <div>
        <!-- Campi: data e scontrino, poi quantità, prezzo e IVA, poi note -->
        <div class="flex-1 min-w-[18rem] grid gap-4">
          <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
            <InputDateField
              v-model="model.date"
              inputId="date"
              :label="constants.date.label"
              :readonly
            />
            <InputTextField
              v-model="model.receiptNumber"
              inputId="receiptNumber"
              :label="constants.receiptNumber.label"
              :readonly
            />
          </div>

          <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
            <InputNumberField
              v-model="model.quantity"
              inputId="quantity"
              :label="constants.quantity.label"
              :readonly
              showButtons
              buttonLayout="horizontal"
              :min="1"
              :max="max"
            />
            <InputAmountField
              v-model="model.salePrice"
              inputId="price"
              :label="constants.price.label"
              :readonly
            />
            <VatRateField
              input-id="vat"
              :label="constants.vat.label"
              v-model="model.vat"
              :readonly
            />
          </div>

          <div class="[&_textarea]:min-h-[2.625rem]">
            <TextAreaField
              v-model="model.notes"
              inputId="notes"
              :rows="1"
              :label="constants.notes.label"
              :readonly
            />
          </div>

          <div class="flex justify-between items-center w-full mt-2">
            <div class="flex gap-2">
              <Button
                type="button"
                severity="secondary"
                :label="pristine ? constants.close.label : constants.cancel.label"
                :icon="pristine ? constants.close.icon : constants.cancel.icon"
                @click="emit('close')"
              />
              <Button
                v-if="dirty"
                type="button"
                :icon="constants.reset?.icon"
                severity="secondary"
                variant="text"
                rounded
                :aria-label="constants.reset?.label"
                @click="emit('reset')"
              />
            </div>
            <div class="flex gap-2">
              <Button
                v-if="existingItem"
                type="button"
                rounded
                text
                icon="pi pi-trash"
                severity="secondary"
                @click="emit('delete')"
              />
              <Button
                v-if="!existingItem && available"
                type="button"
                :label="constants.save.label"
                :icon="constants.save.icon"
                @click="emit('submit')"
              />
              <Button
                v-else-if="dirty"
                type="button"
                :label="constants.update.label"
                :icon="constants.update.icon"
                @click="emit('submit')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ChangesDialog :changes="changes ?? []" group="saleDifferences"></ChangesDialog>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
import { computed } from 'vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import VatRateField from '@/components/layout/fields/VatRateField.vue'
import InputNumberField from '@/components/layout/fields/InputNumberField.vue'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'

import type { FieldChange } from '@/composables/useOriginalData'
import type { Sale } from '@/types/sale'
import InputDateField from '../layout/fields/InputDateField.vue'
import { useProductSaleConstants } from '@/utils/i18nConstants'
import InputTextField from '../layout/fields/InputTextField.vue'

const constants = useProductSaleConstants()

interface ValidationResult {
  fields: Record<string, { message?: string; validate: boolean; _valid: boolean; valid: boolean }>
  validate: boolean
  _valid: boolean
  valid: boolean
}

interface SaleFormProps {
  editable?: boolean
  loading?: boolean
  validation?: ValidationResult
  changes?: FieldChange[]
  dirty?: boolean
  pristine?: boolean
  existingItem?: boolean
  max?: number
}

const props = withDefaults(defineProps<SaleFormProps>(), {
  editable: false,
  loading: false,
})

const emit = defineEmits<{
  submit: []
  close: []
  edit: []
  delete: []
  reset: []
}>()

const model = defineModel<Sale>({ required: true })

const available = computed(() => !!props.max && props.max >= 1)
// Senza giacenza il box di vendita è disabilitato
const readonly = computed(() => !props.editable || !available.value)
</script>
