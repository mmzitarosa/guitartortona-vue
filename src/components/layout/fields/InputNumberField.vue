<template>
  <InputValidationField :inputId :label :invalid :error="validation?.message">
    <InputNumber
      v-model="model"
      :inputId="inputId"
      :minFractionDigits="0"
      :maxFractionDigits="0"
      :min="0"
      :readonly
      :invalid
      class="p-inputwrapper-filled"
      fluid
      @input="(event) => (model = event.value as number | undefined)"
      v-tooltip="tooltip"
      @update:modelValue="(val) => (model = val === null ? undefined : val)"
    />
  </InputValidationField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InputNumber } from 'primevue'
import InputValidationField from '@/components/layout/fields/InputValidationField.vue'

interface InputAmountFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  validation?: { message?: string; valid: boolean }
  tooltip?: string
}

const props = defineProps<InputAmountFieldProps>()

const model = defineModel<number | undefined>()

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
