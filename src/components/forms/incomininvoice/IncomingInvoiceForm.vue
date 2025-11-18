<template>
  <Card>
    <template #title>{{ constants.card.title }}</template>
    <template #subtitle>{{ constants.card.subtitle }}</template>
    <template #content>
      <ProgressBar
        :mode="loading ? 'indeterminate' : 'determinate'"
        class="mt-2 max-h-[1px]"
      ></ProgressBar>

      <div class="grid gap-4 w-full mt-6">
        <!-- Prima riga: fornitore e data-->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <SelectField
            v-model="model.supplier"
            inputId="supplier"
            :label="constants.supplier.label"
            :loading="suppliersLoading"
            :options="suppliers"
            optionId="id"
            optionLabel="name"
            :formatter="supplierFormatter"
            editable
            showClear
            :readonly
            :validation="validation.fields.supplier"
          />

          <InputDateField
            v-model="model.date"
            inputId="date"
            :label="constants.date.label"
            :readonly
            :validation="validation.fields.date"
          />
        </div>

        <!-- Seconda riga: numero e importo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <InputTextField
            v-model="model.number"
            inputId="number"
            :label="constants.number.label"
            :readonly
            :validation="validation.fields.number"
          />

          <InputAmountField
            v-model="model.amount"
            inputId="amount"
            :label="constants.amount.label"
            :readonly
            :validation="validation.fields.amount"
          />
        </div>

        <!-- Terza riga: note -->
        <div class="col-span-full">
          <TextAreaField
            v-model="model.notes"
            inputId="notes"
            :label="constants.notes.label"
            :readonly
          >
          </TextAreaField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full mt-2">
        <!-- Bottoni di sinistra -->
        <div class="flex gap-2">
          <!-- Bottone Chiudi - Visualizzazione/Modifica senza cambiamenti-->
          <Button
            v-if="backable && existingItem && pristine"
            type="button"
            severity="secondary"
            :label="constants.close.label"
            :icon="constants.close.icon"
            @click="emit('close')"
          />
          <!-- Tasto Annulla - Inserimento/Modifica con cambiamenti -->
          <Button
            v-else-if="backable"
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
            v-if="!readonly && existingItem"
            type="button"
            rounded
            text
            icon="pi pi-trash"
            severity="secondary"
            @click="emit('delete')"
          />

          <!-- Tasto Edit - Visualizzazione  -->
          <Button
            v-if="readonly"
            type="button"
            rounded
            text
            icon="pi pi-pen-to-square"
            severity="secondary"
            @click="emit('edit')"
          />

          <!-- Tasto Aggiungi - Inserimento  -->
          <Button
            v-if="!readonly && !existingItem"
            type="button"
            :label="constants.save.label"
            :icon="constants.save.icon"
            @click="emit('submit')"
          />

          <!-- Tasto Aggiorna - Modifica con cambiamenti   -->
          <Button
            v-else-if="!readonly && dirty"
            type="button"
            :label="constants.update.label"
            :icon="constants.update.icon"
            @click="emit('submit')"
          />

          <Button
            v-else-if="isEditable(model)"
            type="button"
            outlined
            label="Conferma"
            icon="pi pi-check"
            @click="emit('complete')"
          />
        </div>
      </div>
    </template>
  </Card>
  <ChangesDialog :changes></ChangesDialog>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Card from 'primevue/card'
import { Button, ProgressBar } from 'primevue'
import type { IncomingInvoice } from '@/types/incomingInvoice'
import { isEditable } from '@/types/incomingInvoice'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import SelectField from '@/components/layout/fields/SelectField.vue'
import { useSuppliers } from '@/composables/useSuppliers'
import { useIncomingInvoiceConstants } from '@/utils/i18nConstants'

const constants = useIncomingInvoiceConstants()

interface IncomingInvoiceFormProps {
  editable?: boolean
  backable?: boolean
  loading?: boolean
  validation: {
    fields: Record<string, { message?: string; valid: boolean }>
    valid: boolean
  }
  changes: Array<{ field: string; oldValue: unknown; newValue: unknown; ignore: boolean }>
  dirty: boolean
  pristine: boolean
  existingItem: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceFormProps>(), {
  editable: false,
  backable: true,
  loading: false,
})

const emit = defineEmits<{
  submit: []
  complete: []
  close: []
  edit: []
  delete: []
  reset: []
}>()
const model = defineModel<IncomingInvoice>({ required: true })

const {
  suppliers,
  loading: suppliersLoading,
  loadSuppliers,
  formatter: supplierFormatter,
} = useSuppliers()

const readonly = computed(() => !props.editable)

onMounted(async () => {
  await loadSuppliers()
})
</script>
