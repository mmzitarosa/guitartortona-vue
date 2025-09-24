<template>
  <InputField :inputId :label :invalid :error="validation?.message">
    <InputText v-model="model" :id="inputId" :readonly :invalid class="p-filled" fluid />
  </InputField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InputText } from 'primevue'
import InputField from '@/components/layout/fields/InputField.vue'

interface InputTextFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  validation?: { message?: string; valid: boolean }
}

const props = defineProps<InputTextFieldProps>()

const model = defineModel<string | undefined>()

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
