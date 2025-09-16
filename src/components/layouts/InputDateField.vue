<template>
  <InputField :inputId :label :invalid :error="validation?.message">

    <InputText v-if="readonly" :value="model"
               :id="inputId"
               readonly fluid
               class="p-filled" />

    <DatePicker v-else :modelValue="date"
                @update:model-value="updateValue"
                :inputId :invalid
                placeholder="gg/mm/aaaa"
                dateFormat="dd/mm/yy"
                show-icon icon-display="input"
                class="p-inputwrapper-filled" fluid />

  </InputField>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { DatePicker, InputText } from 'primevue'
import InputField from '@/components/layouts/InputField.vue'
import { validateDate } from '@/utils/dateUtils.ts'

interface InputDateFieldProps {
  inputId: string,
  label: string,
  readonly?: boolean;
  validation?: { message?: string, valid: boolean };
}

const props = defineProps<InputDateFieldProps>()

const model = defineModel<string | undefined>()

const date = computed(() => validateDate(model.value))

const updateValue = (date: any) => {
  if (date)
    model.value = String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear()
  else model.value = undefined
}

//TODO qui si può pulire
const invalid = computed(() => !props.readonly && props.validation ? !props.validation.valid : false)

</script>
