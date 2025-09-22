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
        <!-- Prima riga: data-->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <InputDateField
            v-model="ledgerEntry.date"
            inputId="date"
            :label="constants.date.label"
            :readonly
            :validation="validation.fields.date"
          />
        </div>

        <!-- Seconda riga: numero fattura e data fattura -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <InputTextField
            v-model="ledgerEntry.invoiceNumber"
            inputId="invoiceNumber"
            :label="constants.invoiceNumber.label"
            :readonly
            :validation="validation.fields.invoiceNumber"
          />

          <InputDateField
            v-model="ledgerEntry.invoiceDate"
            inputId="invoiceDate"
            :label="constants.invoiceDate.label"
            :readonly
            :validation="validation.fields.invoiceDate"
          />
        </div>

        <!-- Terza riga: descrizione e causale -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <TextAreaField
            v-model="ledgerEntry.description"
            inputId="description"
            :rows="3"
            :label="constants.description.label"
            :readonly
            :validation="validation.fields.description"
          />

          <InputTextField
            v-model="ledgerEntry.reason"
            inputId="reason"
            :label="constants.reason.label"
            :readonly
            :validation="validation.fields.reason"
          />
        </div>

        <!-- Quarta riga: tipoPagamento e numero ricevuta -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <SelectButtonField
            v-model="ledgerEntry.paymentType"
            inputId="paymentType"
            :options="paymentTypes"
            optionValue="value"
            optionLabel="label"
            :readonly
            :validation="validation.fields.paymentType"
          />

          <InputTextField
            v-model="ledgerEntry.receiptNumber"
            inputId="receiptNumber"
            :label="constants.receiptNumber.label"
            :readonly
            :validation="validation.fields.receiptNumber"
          />
        </div>

        <!-- Quinta riga: metodoPagamento e banca -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <SelectButtonField
            v-model="ledgerEntry.paymentMethod"
            inputId="paymentMethod"
            :options="paymentMethods"
            optionValue="value"
            optionLabel="label"
            :readonly
            :validation="validation.fields.paymentMethod"
          />

          <ComboBox
            v-model="ledgerEntry.bank"
            inputId="bank"
            optionId="id"
            optionLabel="name"
            :options="banks"
            :label="constants.bank.label"
            :readonly
            :loading="banksLoading"
            :validation="validation.fields.bank"
          />
        </div>

        <!-- Sesta riga: tipoMovimento e importo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <SelectButtonField
            v-model="ledgerEntry.movementType"
            inputId="movementType"
            :options="movementTypes"
            optionValue="value"
            optionLabel="label"
            :readonly
            :validation="validation.fields.movementType"
          />

          <InputAmountField
            v-model="ledgerEntry.amount"
            inputId="amount"
            :label="constants.amount.label"
            :readonly
            :validation="validation.fields.amount"
          />
        </div>

        <!-- Settima riga: note -->
        <div class="col-span-full">
          <TextAreaField
            v-model="ledgerEntry.notes"
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
            v-else-if="newItem"
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
  <ChangesDialog :changes="changes"></ChangesDialog>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { Button, ProgressBar } from 'primevue'
import { useBanks } from '@/composables/useBanks.ts'
import { onMounted } from 'vue'

import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import { type FormOptions, useFormState } from '@/composables/useFormState.ts'
import { useForm } from '@/composables/useForm.ts'
import {
  type LedgerEntry,
  movementTypes,
  paymentMethods,
  paymentTypes,
} from '@/types/ledgerEntry.ts'
import {
  deleteLedgerEntryById,
  getLedgerEntryById,
  postLedgerEntry,
  putLedgerEntryById,
} from '@/services/api/ledgerService.ts'
import { validateDate } from '@/utils/dateUtils.ts'
import InputDateField from '@/components/layout/InputDateField.vue'
import InputTextField from '@/components/layout/InputTextField.vue'
import TextAreaField from '@/components/layout/TextAreaField.vue'
import InputAmountField from '@/components/layout/InputAmountField.vue'
import ComboBox from '@/components/layout/ComboBox.vue'
import { useLedgerEntryConstants } from '@/utils/i18nConstants'
import SelectButtonField from '@/components/layout/SelectButtonField.vue'
import type { Bank } from '@/types/bank.ts'
import { paymentTypesMap, paymentMethodsMap, movementTypesMap } from '@/types/ledgerEntry.ts'

const emit = defineEmits(['submit', 'close', 'edit', 'delete'])

const constants = useLedgerEntryConstants()

interface LedgerEntryFormProps extends FormOptions {
  backable?: boolean
}

const props = withDefaults(defineProps<LedgerEntryFormProps>(), {
  editable: false,
  backable: true,
})

const { banks, loading: banksLoading, loadBanks } = useBanks()

const {
  item: ledgerEntry,
  loading: formLoading,
  changes,
  dirty,
  pristine,
  loadItem: loadLedgerEntry,
  validation,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete,
} = useForm<LedgerEntry>({
  getById: getLedgerEntryById,
  create: postLedgerEntry,
  update: putLedgerEntryById,
  remove: deleteLedgerEntryById,

  fieldMappings: [
    {
      key: 'date',
      label: constants.date.label,
      validator: (date: string | undefined) => {
        if (!date) return { message: constants.date.messages.required }
        else if (!validateDate(date)) return { message: constants.date.messages.invalid }
      },
    },
    {
      key: 'invoiceNumber',
      label: constants.invoiceNumber.label,
      validator: (invoiceNumber: string | undefined) => {
        if (invoiceNumber && invoiceNumber.length > 50)
          return { message: constants.invoiceNumber.messages.tooLong }
      },
    },
    {
      key: 'invoiceDate',
      label: constants.invoiceDate.label,
      validator: (invoiceDate: string | undefined) => {
        if (invoiceDate && !validateDate(invoiceDate))
          return { message: constants.invoiceDate.messages.invalid }
      },
    },
    {
      key: 'description',
      label: constants.description.label,
      validator: (description: string | undefined) => {
        if (!description) return { message: constants.description.messages.required }
        else if (description.length > 255)
          return { message: constants.description.messages.tooLong }
      },
    },
    {
      key: 'reason',
      label: constants.reason.label,
      validator: (reason: string | undefined) => {
        if (reason && reason.length > 100) return { message: constants.reason.messages.tooLong }
      },
    },
    {
      key: 'paymentType',
      label: constants.paymentType.label,
      labeler: (paymentType: string | undefined) =>
        !!paymentType ? paymentTypesMap[paymentType].label : undefined,
    },
    {
      key: 'receiptNumber',
      label: constants.receiptNumber.label,
      validator: (receiptNumber: string | undefined) => {
        if (receiptNumber && receiptNumber.length > 5)
          return { message: constants.receiptNumber.messages.tooLong }
      },
    },
    {
      key: 'bank',
      label: constants.bank.label,
      getter: (bank: Bank | undefined) => bank?.id,
      labeler: (bank: Bank | undefined) => bank?.name,
      validator: (bank: Bank | undefined) => {
        if (!bank && ledgerEntry.value.paymentMethod === 'BANK')
          return { message: constants.bank.messages.required }
      },
    },
    {
      key: 'paymentMethod',
      label: constants.paymentMethod.label,
      labeler: (paymentMethod: string | undefined) =>
        !!paymentMethod ? paymentMethodsMap[paymentMethod].label : undefined,
      validator: (paymentMethod: string | undefined) => {
        if (ledgerEntry.value.bank && paymentMethod !== 'BANK') return {}
        else if (!paymentMethod && (ledgerEntry.value.amount || ledgerEntry.value.movementType))
          return {}
      },
    },
    {
      key: 'movementType',
      label: constants.movementType.label,
      labeler: (movementType: string | undefined) =>
        !!movementType ? movementTypesMap[movementType].label : undefined,
      validator: (movementType: string | undefined) => {
        if (!movementType && (ledgerEntry.value.amount || ledgerEntry.value.paymentMethod))
          return {}
      },
    },
    {
      key: 'amount',
      label: constants.amount.label,
      labeler: (amount: number | undefined) =>
        amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
      validator: (amount: number | undefined) => {
        if (amount && amount <= 0) return { message: constants.amount.messages.invalid }
        else if (!amount && (ledgerEntry.value.movementType || ledgerEntry.value.paymentMethod))
          return { message: constants.amount.messages.required }
      },
    },
    {
      key: 'notes',
      label: constants.notes.label,
    },
  ],
})

const { readonly, newItem, existingItem } = useFormState(props)

onMounted(async () => {
  formLoading.value = true
  await loadBanks()
  if (props.id) await loadLedgerEntry(props.id as number)
  formLoading.value = false
})

const onFormSubmit = async () => {
  const result = await handleSubmit()
  if (!result) return
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
