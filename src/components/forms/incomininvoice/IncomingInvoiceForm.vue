<template>
  <Card>
    <template #title>{{ constants.card.title }}</template>
    <template #subtitle>{{ constants.card.subtitle }}</template>
    <template #content>
      <ProgressBar
        :mode="formLoading ? 'indeterminate' : 'determinate'"
        class="mt-2 bg-gre"
        style="height: 1px"
      ></ProgressBar>
      <div class="grid gap-4 w-full mt-6">
        <!-- Prima riga: fornitore e data-->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <SelectField
            v-model="incomingInvoice.supplier"
            inputId="supplier"
            optionId="id"
            optionLabel="name"
            :options="suppliers"
            editable
            showClear
            :label="constants.supplier.label"
            :readonly
            :loading="suppliersLoading"
            :validation="validation.fields.supplier"
            :formatter="supplierFormatter"
          />

          <InputDateField
            v-model="incomingInvoice.date"
            inputId="date"
            :label="constants.date.label"
            :readonly
            :validation="validation.fields.date"
          />
        </div>

        <!-- Seconda riga: numero e importo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <InputTextField
            v-model="incomingInvoice.number"
            inputId="number"
            :label="constants.number.label"
            :readonly
            :validation="validation.fields.number"
          />

          <InputAmountField
            v-model="incomingInvoice.amount"
            inputId="amount"
            :label="constants.amount.label"
            :readonly
            :validation="validation.fields.amount"
          />
        </div>

        <!-- Terza riga: note -->
        <div class="col-span-full">
          <TextAreaField
            v-model="incomingInvoice.notes"
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
            @click="onFormClose"
          />
          <!-- Tasto Annulla - Inserimento/Modifica con cambiamenti -->
          <Button
            v-else-if="backable"
            type="button"
            severity="secondary"
            :label="constants.cancel.label"
            :icon="constants.cancel.icon"
            @click="onFormClose"
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
            @click="onFormReset"
          />
        </div>

        <!-- Bottoni di destra -->
        <div class="flex gap-2">
          <!-- Tasto Delete - Visualizzazione  -->
          <Button
            v-if="readonly"
            type="button"
            rounded
            text
            icon="pi pi-trash"
            severity="secondary"
            @click="onFormDelete"
          />

          <!-- Tasto Edit - Visualizzazione  -->
          <Button
            v-if="readonly"
            type="button"
            rounded
            text
            icon="pi pi-pen-to-square"
            severity="secondary"
            @click="onFormEdit"
          />

          <!-- Tasto Aggiungi - Inserimento  -->
          <Button
            v-else-if="!existingItem"
            type="button"
            :label="constants.save.label"
            :icon="constants.save.icon"
            @click="onFormSubmit"
          />

          <!-- Tasto Aggiorna - Modifica con cambiamenti   -->
          <Button
            v-else-if="dirty"
            type="button"
            :label="constants.update.label"
            :icon="constants.update.icon"
            @click="onFormSubmit"
          />
        </div>
      </div>
    </template>
  </Card>
  <ChangesDialog :changes></ChangesDialog>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { Button, ProgressBar } from 'primevue'
import { useSuppliers } from '@/composables/useSuppliers.ts'
import { computed, onMounted } from 'vue'
import type { Supplier } from '@/types/supplier.ts'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import { useForm } from '@/composables/useForm.ts'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'
import {
  deleteIncomingInvoiceById,
  getIncomingInvoiceById,
  postIncomingInvoice,
  putIncomingInvoiceById,
} from '@/services/api/incomingInvoiceService.ts'
import { validateDate } from '@/utils/dateUtils.ts'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import { useIncomingInvoiceConstants } from '@/utils/i18nConstants.ts'
import SelectField from '../../layout/fields/SelectField.vue'

const emit = defineEmits(['submit', 'close', 'edit', 'delete'])

const constants = useIncomingInvoiceConstants()

interface IncomingInvoiceFormProps {
  id?: string | number | null | undefined
  editable?: boolean
  backable?: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceFormProps>(), {
  editable: false,
  backable: true,
})

const { suppliers, loading: suppliersLoading, loadSuppliers, addSupplier } = useSuppliers()

const {
  item: incomingInvoice,
  loading: formLoading,
  changes,
  dirty,
  pristine,
  loadItem: loadIncomingInvoice,
  validation,
  existingItem,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete,
} = useForm<IncomingInvoice>({
  getById: getIncomingInvoiceById,
  create: postIncomingInvoice,
  update: putIncomingInvoiceById,
  remove: deleteIncomingInvoiceById,

  fieldMappings: [
    {
      key: 'supplier',
      label: constants.supplier.label,
      labeler: (supplier: Supplier | undefined) => supplier?.name,
      validator: (supplier: Supplier | undefined) => {
        if (!supplier) return { message: constants.supplier.messages.required }
        else if (supplier.name && supplier.name.length > 150)
          return { message: constants.supplier.messages.tooLong }
      },
    },
    {
      key: 'date',
      label: constants.date.label,
      validator: (date: string | undefined) => {
        if (!date) return { message: constants.date.messages.required }
        else if (!validateDate(date)) return { message: constants.date.messages.invalid }
      },
    },
    {
      key: 'number',
      label: constants.number.label,
      validator: (number: string | undefined) => {
        if (!number) return { message: constants.number.messages.required }
        else if (number.length > 50) return { message: constants.number.messages.tooLong }
      },
    },
    {
      key: 'amount',
      label: constants.amount.label,
      labeler: (amount: number | undefined) =>
        amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
      validator: (amount: number | undefined) => {
        if (!amount) return { message: constants.amount.messages.required }
        else if (amount < 0) return { message: constants.amount.messages.invalid }
      },
    },
    { key: 'notes', label: constants.notes.label },
  ],
})

const readonly = computed(() => !props.editable)

onMounted(async () => {
  formLoading.value = true
  await loadSuppliers()
  if (props.id) await loadIncomingInvoice(props.id as number)

  formLoading.value = false
})

const supplierFormatter = (value: string) => {
  return { id: undefined, name: value } as Supplier
}

const onFormSubmit = async () => {
  const result = await handleSubmit()
  if (!result) return
  addSupplier(result.supplier)
  emit('submit', result)
}

const onFormReset = async () => {
  await handleReset()
}

const onFormEdit = () => {
  emit('edit')
}

const onFormDelete = async () => {
  await handleDelete()
  emit('delete')
}

const onFormClose = async () => {
  await handleClose()
  emit('close')
}
</script>
