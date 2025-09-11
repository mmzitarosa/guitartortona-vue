<template>
  <div v-if="id && !ledgerEntry.id" class="w-full flex items-center mt-2">
    <ProgressSpinner></ProgressSpinner>
  </div>
  <Form v-else
        @submit="onFormSubmit"
        :resolver
        :initial-values="ledgerEntry"
        :validate-on-value-update="true"
  >
    <Card>
      <template #title>{{ constants.card.title }}</template>
      <template #subtitle>{{ constants.card.subtitle }}</template>
      <template #content>
        <div class="grid gap-4 w-full mt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <FormField v-slot="$field" name="date" class="w-full">
              <FloatLabel variant="on">
                <InputMask id="date" v-model="ledgerEntry.date" mask="99/99/9999"
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
            <FormField v-slot="$field" name="invoiceNumber" class="w-full">
              <FloatLabel variant="on">
                <InputText id="invoiceNumber" v-model="ledgerEntry.invoiceNumber"
                           class="p-filled" fluid
                           :readonly />
                <label for="invoiceNumber">{{ constants.invoiceNumber.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>

            <FormField v-slot="$field" name="invoiceDate" class="w-full">
              <FloatLabel variant="on">
                <InputMask id="invoiceDate" v-model="ledgerEntry.invoiceDate" mask="99/99/9999"
                           :readonly fluid
                           class="p-filled" :placeholder="editable ? 'gg/mm/aaaa' : ''"
                           :autoClear="false" />
                <label for="invoiceDate">{{ constants.invoiceDate.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <FormField v-slot="$field" name="description" class="w-full">
              <FloatLabel variant="on">
              <Textarea
                v-model="ledgerEntry.description"
                id="description"
                style="resize: none"
                rows="3"
                auto-resize
                class="p-filled" fluid
                :readonly
              />
                <label for="description">{{ constants.description.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>

            <FormField v-slot="$field" name="reason" class="w-full">
              <FloatLabel variant="on">
                <InputText id="reason" v-model="ledgerEntry.reason" class="p-filled" fluid
                           :readonly />
                <label for="reason">{{ constants.reason.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message
                }}
              </Message>
            </FormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <FormField v-slot="$field" name="paymentType"
                       class="w-full flex justify-center items-center">
              <SelectButton
                v-model="ledgerEntry.paymentType"
                inputId="paymentType"
                :options="paymentTypes"
                optionValue="value"
                optionLabel="label"
                :disabled="readonly"
              />
            </FormField>


            <FormField v-slot="$field" name="receiptNumber" class="w-full">
              <FloatLabel variant="on">
                <InputText id="receiptNumber" v-model="ledgerEntry.receiptNumber"
                           class="p-filled" fluid
                           :readonly />
                <label for="receiptNumber">{{ constants.receiptNumber.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                  $field.error?.message
                }}
              </Message>
            </FormField>

          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <FormField v-slot="$field" name="paymentMethod"
                       class="w-full flex justify-center items-center">
              <SelectButton
                v-model="ledgerEntry.paymentMethod"
                inputId="paymentMethod"
                :options="paymentMethods"
                optionValue="value"
                optionLabel="label"
                :disabled="readonly"
              />
            </FormField>


            <FormField v-slot="$field" name="bank" class="w-full">
              <FloatLabel variant="on">
                <InputText id="bank" v-if="readonly"
                           :value="ledgerEntry.bank ? ledgerEntry.bank.name: ''"
                           class="p-filled" fluid readonly />
                <Select v-else
                        v-model="ledgerEntry.bank"
                        inputId="bank"
                        :options="banks"
                        optionLabel="name"
                        showClear
                        class="p-inputwrapper-filled" fluid />
                <label for="bank">{{ constants.bank.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
            <FormField v-slot="$field" name="movementType"
                       class="w-full  flex justify-center items-center">
              <SelectButton
                v-model="ledgerEntry.movementType"
                inputId="movementType"
                :options="movementTypes"
                optionValue="value"
                optionLabel="label"
                :disabled="readonly"
              />
            </FormField>

            <FormField v-slot="$field" name="amount" class="w-full">
              <FloatLabel variant="on">
                <InputNumber
                  :readonly
                  inputId="amount"
                  mode="currency"
                  currency="EUR"
                  locale="it-IT"
                  v-model="ledgerEntry.amount"
                  class="p-inputwrapper-filled"
                  @input="(event) => {ledgerEntry.amount = event.value as number | undefined}"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :min="0"
                  fluid
                />
                <label for="amount">{{ constants.amount.label }}</label>
              </FloatLabel>
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>
          </div>

          <div class="col-span-full">
            <FormField v-slot="$field" name="notes" class="w-full">
              <FloatLabel variant="on">
                <Textarea
                  v-model="ledgerEntry.notes"
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
              :icon="props.id && hasChanges ? constants.update.icon : constants.save.icon"
            />
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
  SelectButton,
  Textarea
} from 'primevue'
import { Form, FormField, type FormSubmitEvent } from '@primevue/forms'
import { LEDGER } from '@/utils/constants.ts'
import { ledgerEntryResolver } from '@/utils/resolver.ts'
import { computed, onMounted } from 'vue'
import { useLedgerEntryForm } from '@/composables/useLedgerEntryForm.ts'
import { useBanks } from '@/composables/useBanks.ts'
import { movementTypes, paymentMethods, paymentTypes } from '@/types/ledgerEntry.ts'
import ChangesDialog from '@/components/layouts/ChangesDialog.vue'

const constants = LEDGER
const resolver = ledgerEntryResolver

const {
  ledgerEntry,
  loadLedgerEntry,
  changes,
  hasChanges,
  loading: formLoading,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete
} = useLedgerEntryForm()

const { banks } = useBanks()

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

onMounted(() => {
  if (props.id) {
    loadLedgerEntry(props.id as number)
  }
})

const onFormSubmit = (event: FormSubmitEvent) => {
  if (!event.valid) return
  handleSubmit().then((result) => emit('submit', result))
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
