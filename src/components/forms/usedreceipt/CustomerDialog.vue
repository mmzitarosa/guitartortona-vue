<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="customer ? constants.editTitle : constants.newTitle"
    class="w-full max-w-xl mx-4"
  >
    <div class="grid gap-4 mt-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputTextField
          v-model="draft.lastName"
          inputId="customerLastName"
          :label="constants.fields.lastName"
          :validation="validation.lastName"
        />
        <InputTextField
          v-model="draft.firstName"
          inputId="customerFirstName"
          :label="constants.fields.firstName"
          :validation="validation.firstName"
        />
      </div>

      <InputTextField
        v-model="draft.address"
        inputId="customerAddress"
        :label="constants.fields.address"
        :validation="validation.address"
      />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputTextField
          v-model="draft.zipCode"
          inputId="customerZipCode"
          :label="constants.fields.zipCode"
          :validation="validation.zipCode"
        />
        <InputTextField
          v-model="draft.city"
          inputId="customerCity"
          :label="constants.fields.city"
          :validation="validation.city"
        />
        <InputTextField
          v-model="draft.province"
          inputId="customerProvince"
          :label="constants.fields.province"
          :validation="validation.province"
        />
      </div>

      <Divider align="right" type="dashed" class="!m-0 !mb-1">{{ constants.hint }}</Divider>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputTextField
          v-model="draft.documentType"
          inputId="customerDocumentType"
          :label="constants.fields.documentType"
          :validation="validation.documentType"
        />
        <InputTextField
          v-model="draft.documentNumber"
          inputId="customerDocumentNumber"
          :label="constants.fields.documentNumber"
          :validation="validation.documentNumber"
        />
        <InputTextField
          v-model="draft.taxCode"
          inputId="customerTaxCode"
          :label="constants.fields.taxCode"
          :validation="validation.taxCode"
        />
      </div>
    </div>

    <template #footer>
      <Button
        type="button"
        severity="secondary"
        :label="close.label"
        :icon="close.icon"
        @click="visible = false"
      />
      <Button type="button" icon="pi pi-check" :label="constants.save" @click="onSave" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button, Dialog, Divider } from 'primevue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import type { Customer } from '@/types/customer'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'

const props = defineProps<{ customer?: Customer }>()
const emit = defineEmits<{ save: [customer: Customer] }>()
const visible = defineModel<boolean>('visible', { required: true })

const { customerDialog: constants, close } = useUsedReceiptConstants()

const draft = reactive<Customer>({})
const validate = ref(false)

// Ad ogni apertura riparte da una copia dei dati: nulla cambia finché non si conferma
watch(visible, (open) => {
  if (!open) return
  validate.value = false
  Object.keys(draft).forEach((key) => delete draft[key as keyof Customer])
  Object.assign(draft, props.customer ?? {})
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

const onSave = () => {
  validate.value = true
  if (Object.values(errors.value).some(Boolean)) return
  emit('save', { ...draft })
  visible.value = false
}
</script>
