<template>
  <Form
    v-slot="$form"
    v-if="incomingInvoice"
    @submit="onFormSubmit"
    :resolver
    :validate-on-value-update="true"
  > <!-- TODO Controllare quell'if -->
    <Card>
      <template #title>{{ constants.card.title }}</template>
      <template #subtitle>{{ constants.card.subtitle }}</template>
      <template #content>
        <ProgressSpinner v-if="formLoading"></ProgressSpinner>

        <div v-else class="grid grid-cols-2 gap-4 w-full mt-2">
          <FormField v-slot="$field" name="supplier" class="flex flex-col gap-1 w-full">
            <FloatLabel variant="on">
              <InputText id="supplier" v-if="!editable && incomingInvoice.supplier"
                         v-model="incomingInvoice.supplier.name"
                         class="w-full" readonly />
              <Select v-else-if="editable"
                      v-model="incomingInvoice.supplier"
                      inputId="supplier"
                      :options="suppliers"
                      optionLabel="name"
                      showClear
                      editable
                      @focus="loadSuppliers"
                      :loading="suppliersLoading"
                      class="w-full"
              />
              <label for="supplier">{{ constants.supplier.label }}</label>
            </FloatLabel>
            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
              {{ $field.error?.message }}
            </Message>
          </FormField>

          <FormField v-slot="$field" name="date" class="flex flex-col gap-1 w-full">
            <FloatLabel variant="on">
              <InputMask id="date" v-model="incomingInvoice.date" mask="99/99/9999"
                         :readonly="!editable"
                         class="w-full" />
              <label for="date">{{ constants.date.label }}</label>
            </FloatLabel>
            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                $field.error?.message
              }}
            </Message>
          </FormField>

          <FormField v-slot="$field" name="number" class="flex flex-col gap-1 w-full">
            <FloatLabel variant="on">
              <InputText id="number" v-model="incomingInvoice.number" class="w-full"
                         :readonly="!editable" />
              <label for="number">{{ constants.number.label }}</label>
            </FloatLabel>
            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                $field.error?.message
              }}
            </Message>
          </FormField>

          <div class="flex flex-col gap-1 w-full">
          <FormField v-slot="$field" name="amount" class="flex flex-col gap-1 w-full">
            <FloatLabel variant="on">
              <!-- TODO Quando già valorizzato, al click, perde la formattazione -->
              <InputText id="amount" v-if="!editable && incomingInvoice.amount"
                         :value="incomingInvoice.amount.toLocaleString('it-IT', {style: 'currency',currency: 'EUR',})"

                         class="w-full p-filled" readonly />
              <InputNumber v-else-if="editable"
                           inputId="amount"
                           mode="currency"
                           currency="EUR"
                           locale="it-IT"
                           v-model="incomingInvoice.amount"
                           class="w-full"
                           :minFractionDigits="2"
                           :maxFractionDigits="2"
                           @focus="onFocus"
                           @blur="onBlur"
                           @update:modelValue="onUpdate"
              />

              <label for="amount">{{ constants.amount.label }}</label>
            </FloatLabel>
            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                $field.error?.message
              }}
            </Message>
          </FormField>

          </div>
          <FormField v-slot="$field" name="notes" class="flex flex-col gap-1 w-full col-end-3">
            <FloatLabel variant="on">
              <Textarea
                v-model="incomingInvoice.notes"
                id="notes"
                style="resize: none"
                rows="2"
                auto-resize
                class="w-full p-filled"
                :readonly="!editable"
              />
              <label for="notes">{{ constants.notes.label }}</label>
            </FloatLabel>
            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                $field.error?.message
              }}
            </Message>
          </FormField>

        </div>

      </template>

      <template #footer>
        <div class="flex justify-between items-center w-full">
          <!-- Bottoni di sinistra -->
          <div class="flex gap-2">
            <Button
              type="button"
              severity="secondary"
              :label="props.id && !hasChanges ? 'TODO Chiudi' : constants.cancel.label"
              :icon="constants.cancel.icon"
              @click="onFormClose"
            />
            <Button
              type="button"
              v-if="hasChanges"
              :icon="constants.reset?.icon"
              severity="secondary"
              variant="text"
              rounded
              aria-label="Filter"
              @click="handleReset($form)"
            />
          </div>

          <!-- Bottone di destra -->
          <Button
            v-if="!props.id || hasChanges"
            type="submit"
            :loading="formLoading"
            :disabled="!hasChanges"
            :label="props.id && hasChanges ? 'TODO Aggiorna' : constants.save.label"
            :icon="props.id ? 'pi pi-sync' : constants.save.icon"
          />
        </div>
      </template>
    </Card>
  </Form>
</template>

<script setup lang="ts">

import Card from 'primevue/card'
import {
  Button,
  DatePicker,
  FloatLabel,
  InputText,
  InputMask,
  InputNumber,
  Message,
  ProgressSpinner,
  Select,
  Textarea
} from 'primevue'
import { Form, FormField, type FormSubmitEvent } from '@primevue/forms'
import { INCOMING_INVOICE } from '@/utils/constants.ts'
import { incomingInvoiceResolver } from '@/utils/resolver.ts'
import { useSuppliers } from '@/composables/useSuppliers.ts'
import { useIncomingInvoiceForm } from '@/composables/useIncomingInvoiceForm.ts'
import { onMounted, ref, watch } from 'vue'
import type { Supplier } from '@/types/supplier.ts'

const constants = INCOMING_INVOICE
const resolver = incomingInvoiceResolver
const { suppliers, loading: suppliersLoading, loadSuppliers } = useSuppliers()
const {
  incomingInvoice,
  hasChanges,
  loadIncomingInvoice,
  loading: formLoading,
  handleSubmit,
  handleReset,
  handleClose
} = useIncomingInvoiceForm()

const props = defineProps({
  id: {
    type: [Number, null]
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'close'])
const tmpAmount = ref<number | undefined>(undefined)

onMounted(() => {
  if (props.id) {
    loadIncomingInvoice(props.id as number).then(value => suppliers.value = [value.supplier as Supplier])
  }
})

const onFormSubmit = (event: FormSubmitEvent) => {
  if (!event.valid) return
  handleSubmit().then(result => emit('submit', result))
}

const onFormClose = ($form: any) => {
  handleClose($form).then(() => emit('close'))
}


// E' un gran porcheria, ma purtroppo questo è ciò che sono riuscito a produrre
// Al primo click sull'InputNumber perde la formattazione se valorizzato giò di base
const done = ref(false)
const blur = ref(false)

const onFocus = () => {
  if (props.editable && props.id && !done.value) {
    done.value = true
    tmpAmount.value = incomingInvoice.value.amount
    incomingInvoice.value.amount = undefined
  }
}

const onBlur = () => {
  if (props.editable && props.id)
    blur.value = true
}

const onUpdate = () => {
  if (props.editable && props.id && done.value && blur.value && !incomingInvoice.value.amount) {
    incomingInvoice.value.amount = tmpAmount.value
    done.value = false
    blur.value = false
  }
}
</script>
