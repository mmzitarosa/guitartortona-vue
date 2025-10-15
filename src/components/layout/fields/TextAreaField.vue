<template>
  <InputValidationField :inputId :label :invalid :error="validation?.message" class="mb-[-4px]">
    <Textarea
      v-model="model"
      :id="inputId"
      :rows="rows ?? 2"
      auto-resize
      :readonly
      :invalid
      class="p-filled resize-none"
      fluid
    />
  </InputValidationField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from 'primevue'
import InputValidationField from '@/components/layout/fields/InputValidationField.vue'

interface TextAreaFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  validation?: { message?: string; valid: boolean }
  rows?: number
}

const props = defineProps<TextAreaFieldProps>()

const model = defineModel<string | undefined>()

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
