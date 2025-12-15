<template>
  <InputValidationField :inputId :label :invalid :error="validation?.message">
    <InputText v-if="readonly" :value="model" :id="inputId" readonly fluid class="p-filled" />

    <DatePicker
      v-else
      v-model="date"
      :inputId
      :invalid
      :placeholder="constants.dateFormat"
      show-icon
      icon-display="input"
      class="p-inputwrapper-filled"
      fluid
    />
  </InputValidationField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DatePicker, InputText } from 'primevue'
import InputValidationField from '@/components/layout/fields/InputValidationField.vue'
import { parseDate } from '@/utils/dateUtils'
import { useLayoutConstants } from '@/utils/i18nConstants'

interface InputDateFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  validation?: { message?: string; valid: boolean }
}

const props = defineProps<InputDateFieldProps>()

const model = defineModel<Date | undefined>()
const constants = useLayoutConstants()

const date = computed({
  get: () => model.value,
  set: (date: string | undefined) => model.value = parseDate(date)
})

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false
)
</script>
