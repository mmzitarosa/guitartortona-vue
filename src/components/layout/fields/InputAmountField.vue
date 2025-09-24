<template>
  <InputField :inputId :label :invalid :error="validation?.message">
    <InputNumber
      v-model="model"
      :inputId="inputId"
      mode="currency"
      currency="EUR"
      locale="it-IT"
      :minFractionDigits="2"
      :maxFractionDigits="2"
      :min="0"
      :readonly
      :invalid
      class="p-inputwrapper-filled"
      fluid
      @input="(event) => (model = event.value as number | undefined)"
      @update:modelValue="(val) => (model = val === null ? undefined : val)"
    />
  </InputField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InputNumber } from 'primevue'
import InputField from '@/components/layout/fields/InputField.vue'

interface InputAmountFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  validation?: { message?: string; valid: boolean }
}

const props = defineProps<InputAmountFieldProps>()

const model = defineModel<number | undefined>()

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
