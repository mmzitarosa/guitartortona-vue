<template>
  <div v-if="id && !incomingInvoice.id" class="w-full flex items-center mt-2">
    <ProgressSpinner></ProgressSpinner>
  </div>
  <Form v-else
        @submit="onFormSubmit"
        :resolver
        :initial-values="incomingInvoice"
        :validate-on-value-update="true"
  >
    <Card>
      <template #title>{{ constants.card.title }}</template>
      <template #subtitle>{{ constants.card.subtitle }}</template>
      <template #content>
        <div class="grid gap-4 w-full mt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <FormField v-slot="$field" name="supplier" class="w-full">
              <FloatLabel variant="on">
                <ComboBox v-model="incomingInvoice.supplier" :options="suppliers" optionId="id" optionLabel="name" inputId="supplier" showClear :editable fluid @focus="loadSuppliers"/>
                <label for="supplier">{{ constants.supplier.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <FormField v-slot="$field" name="date" class="w-full">
              <FloatLabel variant="on">
                <InputMask id="date" v-model="incomingInvoice.date" mask="99/99/9999"
                           :readonly fluid
                           class="p-filled" placeholder="gg/mm/aaaa" :autoClear="false" />
                <label for="date">{{ constants.date.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">

            <FormField v-slot="$field" name="number" class="w-full">
              <FloatLabel variant="on">
                <InputText id="number" v-model="incomingInvoice.number" class="p-filled" fluid
                           :readonly />
                <label for="number">{{ constants.number.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>

            <FormField v-slot="$field" name="amount" class="w-full">
              <FloatLabel variant="on">

                <InputNumber :readonly
                             inputId="amount"
                             mode="currency"
                             currency="EUR"
                             locale="it-IT"
                             v-model="incomingInvoice.amount"
                             class="p-inputwrapper-filled"
                             @input="(event) => {incomingInvoice.amount = event.value as number | undefined}"
                             :minFractionDigits="2"
                             :maxFractionDigits="2"
                             :min="0"
                             fluid
                />

                <label for="amount">{{ constants.amount.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>

          </div>

          <div class="col-span-full">
            <FormField v-slot="$field" name="notes" class="w-full">
              <FloatLabel variant="on">
                <Textarea
                  v-model="incomingInvoice.notes"
                  id="notes"
                  style="resize: none"
                  rows="2"
                  auto-resize
                  class="p-filled" fluid
                  :readonly
                />
                <label for="notes">{{ constants.notes.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>
          </div>

        </div>

      </template>

      <template #footer>
        <div class="flex justify-between items-center w-full mt-2">
          <!-- Bottoni di sinistra -->
          <div class="flex gap-2">
            <Button v-if="backable"
                    type="button"
                    severity="secondary"
                    :label="props.id && !hasChanges ? constants.close.label : constants.cancel.label"
                    :icon="props.id && !hasChanges ? constants.close.icon : constants.cancel.icon"
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
              @click="onFormReset"
            />
          </div>

          <div class="flex gap-2">
            <!-- Bottone di destra -->
            <Button
              v-if="readonly"
              type="button"
              rounded
              text
              icon="pi pi-trash"
              severity="secondary"
              @click="onFormDelete"
            />

            <Button
              v-if="readonly"
              type="button"
              rounded
              text
              icon="pi pi-pen-to-square"
              severity="secondary"
              @click="onFormEdit"
            />

            <Button
              v-else-if="!props.id || hasChanges"
              type="submit"
              :loading="formLoading"
              :disabled="!hasChanges"
              :label="props.id && hasChanges ? constants.update.label : constants.save.label"
              :icon="props.id && hasChanges ? constants.update.icon : constants.save.icon" />

          </div>
        </div>
      </template>
    </Card>
  </Form>
  <ChangesDialog :changes="changes"></ChangesDialog>
</template>

<script setup lang="ts">

import Card from 'primevue/card'
import {
  Button,
  FloatLabel,
  InputMask,
  InputNumber,
  InputText,
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
import { computed, onMounted, type Ref, ref, watch, watchEffect } from 'vue'
import type { Supplier } from '@/types/supplier.ts'
import ChangesDialog from '@/components/layouts/ChangesDialog.vue'
import ComboBox from '@/components/layouts/ComboBox.vue'

const constants = INCOMING_INVOICE
const resolver = incomingInvoiceResolver

const { suppliers, loading: suppliersLoading, loadSuppliers } = useSuppliers()
const {
  incomingInvoice,
  loadIncomingInvoice,
  changes,
  hasChanges,
  loading: formLoading,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete
} = useIncomingInvoiceForm()

const props = defineProps({
  id: {
    type: [Number, null]
  },
  editable: {
    type: Boolean,
    default: false
  },
  backable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit', 'close', 'edit', 'delete'])
const readonly = computed(() => !props.editable)

// Per trattare il valore del comboBox editabile come oggetto anziché stringa
const supplier: Ref<Supplier | undefined> = ref(undefined)

onMounted(() => {
  if (props.id) {
    loadIncomingInvoice(props.id as number).then(value => suppliers.value = [value.supplier as Supplier])
  }
})

const onFormSubmit = (event: FormSubmitEvent) => {
  if (!event.valid) return
  handleSubmit().then((result) => {
      suppliers.value = [result.supplier as Supplier]
      emit('submit', result)
    }
  )
}

const onFormReset = () => {
  handleReset()
}

const onFormEdit = () => {
  emit('edit')
}

const onFormDelete = () => {
  handleDelete().then(() => emit('delete'))
}

const onFormClose = () => {
  handleClose().then(() => emit('close'))
}

</script>
