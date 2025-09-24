<template>
  <InputField :inputId :label :invalid :error="validation?.message">
    <InputText v-if="readonly" :value="model" :id="inputId" readonly fluid class="p-filled" />

    <DatePicker
      v-else
      :modelValue="date"
      @update:model-value="updateValue"
      :inputId
      :invalid
      :placeholder="constants.dateFormat"
      dateFormat="dd/mm/yy"
      show-icon
      icon-display="input"
      class="p-inputwrapper-filled"
      fluid
    />
  </InputField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DatePicker, InputText } from 'primevue'
import InputField from '@/components/layout/fields/InputField.vue'
import { validateDate } from '@/utils/dateUtils.ts'
import { useLayoutConstants } from '@/utils/i18nConstants.ts'

interface InputDateFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  validation?: { message?: string; valid: boolean }
}

const props = defineProps<InputDateFieldProps>()

const model = defineModel<string | undefined>()
const constants = useLayoutConstants()

const date = computed(() => validateDate(model.value))

const updateValue = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  if (value && !Array.isArray(value)) {
    model.value =
      String(value.getDate()).padStart(2, '0') +
      '/' +
      String(value.getMonth() + 1).padStart(2, '0') +
      '/' +
      value.getFullYear()
  } else {
    model.value = undefined
  }
}

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
