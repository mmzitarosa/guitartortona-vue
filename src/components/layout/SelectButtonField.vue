<template>
  <span class="w-full flex justify-center items-center">
    <SelectButton
      v-model="model"
      :inputId
      :options
      :optionValue
      :optionLabel
      :invalid
      :disabled="readonly"
      @update:modelValue="(val) => (model = val === null ? undefined : val)"
    />
  </span>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'
import { SelectButton } from 'primevue'

interface SelectButtonFieldProps<T extends Record<string, any>> {
  inputId: string
  readonly?: boolean
  options: T[]
  optionValue: keyof T
  optionLabel: keyof T
  validation?: { message?: string; valid: boolean }
}

const props = defineProps<SelectButtonFieldProps<T>>()

const model = defineModel<string | undefined>()

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
