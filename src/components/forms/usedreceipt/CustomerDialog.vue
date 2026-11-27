<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="customer ? constants.editTitle : constants.newTitle"
    :closable="!registry"
    :closeOnEscape="!registry"
    class="w-full max-w-xl mx-4"
  >
    <Message v-if="registry && archived" severity="warn" icon="pi pi-trash" class="mb-4">
      {{ archivedMessage }}
    </Message>

    <div class="grid gap-4 mt-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputTextField
          v-model="draft.lastName"
          :readonly="readonly"
          inputId="customerLastName"
          :label="constants.fields.lastName"
          :validation="validation.lastName"
        />
        <InputTextField
          v-model="draft.firstName"
          :readonly="readonly"
          inputId="customerFirstName"
          :label="constants.fields.firstName"
          :validation="validation.firstName"
        />
      </div>

      <InputTextField
        v-model="draft.address"
        :readonly="readonly"
        inputId="customerAddress"
        :label="constants.fields.address"
        :validation="validation.address"
      />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputTextField
          v-model="draft.zipCode"
          :readonly="readonly"
          inputId="customerZipCode"
          :label="constants.fields.zipCode"
          :validation="validation.zipCode"
        />
        <InputTextField
          v-model="draft.city"
          :readonly="readonly"
          inputId="customerCity"
          :label="constants.fields.city"
          :validation="validation.city"
        />
        <InputTextField
          v-model="draft.province"
          :readonly="readonly"
          inputId="customerProvince"
          :label="constants.fields.province"
          :validation="validation.province"
        />
      </div>

      <Divider align="right" type="dashed" class="!m-0 !mb-1">{{ constants.hint }}</Divider>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputTextField
          v-model="draft.documentType"
          :readonly="readonly"
          inputId="customerDocumentType"
          :label="constants.fields.documentType"
          :validation="validation.documentType"
        />
        <InputTextField
          v-model="draft.documentNumber"
          :readonly="readonly"
          inputId="customerDocumentNumber"
          :label="constants.fields.documentNumber"
          :validation="validation.documentNumber"
        />
        <InputTextField
          v-model="draft.taxCode"
          :readonly="readonly"
          inputId="customerTaxCode"
          :label="constants.fields.taxCode"
          :validation="validation.taxCode"
        />
      </div>
    </div>

    <template #footer>
      <!-- Anagrafica: stessi bottoni e stesso ordine dei form (Chiudi|Reset — Elimina|Ripristina|Conferma) -->
      <div v-if="registry" class="flex justify-between items-center w-full mt-2">
        <div class="flex gap-2">
          <Button
            type="button"
            severity="secondary"
            :label="(dirty ? buttons.cancel : buttons.close).label"
            :icon="(dirty ? buttons.cancel : buttons.close).icon"
            @click="onClose"
          />
          <Button
            v-if="dirty"
            type="button"
            :icon="buttons.reset.icon"
            :aria-label="buttons.reset.label"
            severity="secondary"
            variant="text"
            rounded
            @click="onReset"
          />
        </div>
        <div class="flex gap-2">
          <Button
            v-if="!archived"
            type="button"
            rounded
            text
            :icon="buttons.delete.icon"
            :aria-label="buttons.delete.label"
            severity="secondary"
            @click="emit('archive')"
          />
          <template v-else>
            <Button
              type="button"
              severity="danger"
              :label="buttons.hardDelete.label"
              :icon="buttons.hardDelete.icon"
              @click="emit('hardDelete')"
            />
            <Button
              type="button"
              severity="secondary"
              :label="buttons.restore.label"
              :icon="buttons.restore.icon"
              @click="emit('restore')"
            />
          </template>
          <Button
            v-if="dirty"
            type="button"
            :label="buttons.confirm.label"
            :icon="buttons.confirm.icon"
            @click="onSave"
          />
        </div>
      </div>
      <template v-else>
        <Button
          type="button"
          severity="secondary"
          :label="close.label"
          :icon="close.icon"
          @click="visible = false"
        />
        <Button type="button" icon="pi pi-check" :label="constants.save" @click="onSave" />
      </template>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Dialog, Divider, Message } from 'primevue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { Customer } from '@/types/customer'
import { useConfirmDialogConstants, useUsedReceiptConstants } from '@/utils/i18nConstants'

// registry: uso dall'anagrafica clienti (stessi bottoni dei form); altrimenti dalla ricevuta
const props = defineProps<{ customer?: Customer; registry?: boolean; archived?: boolean }>()
const emit = defineEmits<{
  save: [customer: Customer]
  archive: []
  restore: []
  hardDelete: []
}>()
const visible = defineModel<boolean>('visible', { required: true })

const { t } = useI18n()
const { customerDialog: constants, close } = useUsedReceiptConstants()
const confirmDialog = useConfirmDialog()
const dialogs = useConfirmDialogConstants()

const button = (key: string) => ({
  label: t(`buttons.${key}.label`),
  icon: t(`buttons.${key}.icon`),
})
const buttons = {
  close: button('close'),
  cancel: button('cancel'),
  reset: button('reset'),
  delete: button('delete'),
  restore: button('restore'),
  hardDelete: button('hardDelete'),
  confirm: button('confirm'),
}
const archivedMessage = t('customers.archivedMessage')

const draft = reactive<Customer>({})
const original = ref<Customer>({})
const validate = ref(false)
const readonly = computed(() => !!props.registry && !!props.archived)

// Ad ogni apertura riparte da una copia dei dati: nulla cambia finché non si conferma
watch(visible, (open) => {
  if (!open) return
  validate.value = false
  Object.keys(draft).forEach((key) => delete draft[key as keyof Customer])
  Object.assign(draft, props.customer ?? {})
  original.value = { ...draft }
})

const LIMITS: Record<string, number> = {
  firstName: 100,
  lastName: 100,
  address: 255,
  zipCode: 10,
  city: 100,
  province: 50,
  documentType: 50,
  documentNumber: 50,
  taxCode: 20,
}
const REQUIRED = ['firstName', 'lastName', 'address', 'zipCode', 'city', 'province']

const errors = computed(() => {
  const result: Record<string, string | undefined> = {}
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = ((draft as Record<string, string | undefined>)[key] ?? '').trim()
    if (REQUIRED.includes(key) && !value) result[key] = constants.required
    else if (value.length > max) result[key] = constants.tooLong
  }
  return result
})

const validation = computed(() =>
  Object.fromEntries(
    Object.keys(LIMITS).map((key) => [
      key,
      { message: errors.value[key], valid: !validate.value || !errors.value[key] },
    ]),
  ),
)

const dirty = computed(() =>
  Object.keys(LIMITS).some(
    (key) =>
      ((draft as Record<string, string | undefined>)[key] ?? '') !==
      ((original.value as Record<string, string | undefined>)[key] ?? ''),
  ),
)

const onSave = () => {
  validate.value = true
  if (Object.values(errors.value).some(Boolean)) return
  emit('save', { ...draft })
  // Nell'anagrafica chiude chi salva, dopo l'esito
  if (!props.registry) visible.value = false
}

const onReset = () =>
  confirmDialog.require({
    header: dialogs.resetDialog.title,
    message: dialogs.resetDialog.message,
    icon: dialogs.resetDialog.icon,
    acceptLabel: dialogs.resetDialog.acceptLabel,
    toastSummary: dialogs.resetDialog.toastTitle,
    toastDetail: dialogs.resetDialog.toastMessage,
    accept: async () => {
      Object.assign(draft, original.value)
      validate.value = false
      return true
    },
  })

const onClose = async () => {
  if (!dirty.value) {
    visible.value = false
    return
  }
  const discard = await confirmDialog.require({
    header: dialogs.cancelDialog.title,
    message: dialogs.cancelDialog.message,
    icon: dialogs.cancelDialog.icon,
    acceptLabel: dialogs.cancelDialog.acceptLabel,
    toastSummary: dialogs.cancelDialog.toastTitle,
    toastDetail: dialogs.cancelDialog.toastMessage,
    accept: async () => true,
  })
  if (discard) visible.value = false
}
</script>
