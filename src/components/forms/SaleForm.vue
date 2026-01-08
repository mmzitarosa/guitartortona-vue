<template>
  <Fieldset :legend="constants.fieldset.legend">
    <div class="grid gap-4 mt-6">
      <InputDateField v-model="model.date" inputId="date" :label="constants.date.label" :readonly />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
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
        <VatRateField input-id="vat" :label="constants.vat.label" v-model="model.vat" :readonly />
      </div>

      <InputTextField
        v-model="model.receiptNumber"
        inputId="receiptNumber"
        :label="constants.receiptNumber.label"
        :readonly
      />

      <InputAmountField
        v-model="model.salePrice"
        inputId="price"
        :label="constants.price.label"
        :readonly
      />

      <TextAreaField
        v-model="model.notes"
        inputId="notes"
        :label="constants.notes.label"
        :readonly
      />

      <div class="flex justify-between items-center w-full mt-2">
        <!-- Bottoni di sinistra -->
        <div class="flex gap-2">
          <!-- Bottone Chiudi - Visualizzazione/Modifica senza cambiamenti-->
          <Button
            v-if="existingItem && pristine"
            type="button"
            severity="secondary"
            label="constants.close.label"
            :icon="constants.close.icon"
            @click="emit('close')"
          />
          <!-- Tasto Annulla - Inserimento/Modifica con cambiamenti -->
          <Button
            v-else-if="existingItem"
            type="button"
            severity="secondary"
            :label="constants.cancel.label"
            :icon="constants.cancel.icon"
            @click="emit('close')"
          />

          <!-- Tasto Reset - Inserimento/Modifica con cambiamenti  -->
          <Button
            type="button"
            v-if="dirty"
            :icon="constants.reset?.icon"
            severity="secondary"
            variant="text"
            rounded
            aria-label="Filter"
            @click="emit('reset')"
          />
        </div>

        <!-- Bottoni di destra -->
        <div class="flex gap-2">
          <!-- Tasto Delete - Visualizzazione  -->
          <Button
            v-if="existingItem"
            type="button"
            rounded
            text
            icon="pi pi-trash"
            severity="secondary"
            @click="emit('delete')"
          />

          <!-- Tasto Aggiungi - Inserimento  -->
          <Button
            v-if="!existingItem && available"
            type="button"
            :label="constants.save.label"
            :icon="constants.save.icon"
            @click="emit('submit')"
          />

          <!-- Tasto Aggiorna - Modifica con cambiamenti   -->
          <!-- TODO Controllare available con max+=original.quantity-->
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
  </Fieldset>
  <ChangesDialog :changes group="saleDifferences"></ChangesDialog>
</template>

<script setup lang="ts">
import { Button, Fieldset } from 'primevue'
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

const readonly = computed(() => !props.editable)

const available = computed(() => props.max && props.max >= 1)
</script>
