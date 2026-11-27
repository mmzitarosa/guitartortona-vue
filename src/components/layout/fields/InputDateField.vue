<template>
  <InputValidationField :inputId :label :invalid :error="validation?.message">
    <InputText
      v-if="readonly"
      :value="formatDate(date)"
      :id="inputId"
      readonly
      fluid
      class="p-filled"
    />

    <DatePicker
      v-else
      v-model="date"
      :inputId
      :invalid
      :placeholder="constants.dateFormat"
      :minDate
      :maxDate
      show-icon
      icon-display="input"
      class="p-inputwrapper-filled"
      fluid
    >
      <!-- X per svuotare il campo, accanto all'icona del calendario (filtri) -->
      <template v-if="clearable" #inputicon="{ clickCallback }">
        <span class="flex items-center gap-2">
          <i v-if="model" class="pi pi-times cursor-pointer" @click.stop="model = undefined" />
          <CalendarIcon class="p-datepicker-input-icon" @click="clickCallback" />
        </span>
      </template>
    </DatePicker>
  </InputValidationField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DatePicker, InputText } from 'primevue'
import CalendarIcon from '@primevue/icons/calendar'
import InputValidationField from '@/components/layout/fields/InputValidationField.vue'
import { formatDate, parseDate } from '@/utils/dateUtils'
import { useLayoutConstants } from '@/utils/i18nConstants'

interface InputDateFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  clearable?: boolean
  minDate?: Date
  maxDate?: Date
  validation?: { message?: string; valid: boolean }
}

const props = defineProps<InputDateFieldProps>()

const model = defineModel<Date | undefined>()
const constants = useLayoutConstants()

const date = computed({
  get: () => model.value,
  set: (date: string | undefined) => (model.value = parseDate(date)),
})

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
