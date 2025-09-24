<template>
  <InputField :inputId :label :invalid :error="validation?.message">
    <InputText v-if="readonly" :value="value" :id="inputId" readonly fluid class="p-filled" />

    <Select
      v-else
      v-model="model"
      :labelId="inputId"
      :loading
      :invalid
      :options="mergedOptions"
      :optionLabel="optionLabel as string"
      :optionValue="optionValue ? (optionValue as string) : undefined"
      :showClear
      :editable
      @update:modelValue="handleModelUpdate"
      class="p-inputwrapper-filled"
      fluid
    />
  </InputField>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'
import { InputText, Select } from 'primevue'
import InputField from '@/components/layout/fields/InputField.vue'

interface SelectFieldProps<T extends Record<string, unknown>> {
  inputId: string
  label: string
  readonly?: boolean
  options: T[]
  optionLabel: keyof T
  optionValue?: keyof T
  loading?: boolean
  validation?: { message?: string; valid: boolean }
  showClear?: boolean
  editable?: boolean
  formatter?: (value: string) => T | T[keyof T]
}

const props = defineProps<SelectFieldProps<T>>()

const model = defineModel<T | T[keyof T]>()

const value = computed(() => {
  if (model.value === undefined) return ''

  // Se optionValue è definito, model.value contiene il valore della proprietà specificata
  if (props.optionValue) {
    const selectedOption = props.options.find(
      (option) => option[props.optionValue!] === model.value,
    )
    return selectedOption ? String(selectedOption[props.optionLabel]) : ''
  }

  // Se optionValue non è definito, model.value è l'oggetto completo
  return String((model.value as T)[props.optionLabel])
})

// Gestisce l'aggiornamento del model quando l'utente digita un valore personalizzato
const handleModelUpdate = (newValue: T | T[keyof T] | string) => {
  // Se il valore è una stringa (input personalizzato) e abbiamo un formatter
  if (typeof newValue === 'string') {
    // Se l'input è vuoto, resetta il model a undefined
    if (newValue === '') {
      model.value = undefined
      return
    }
    if (props.formatter) {
      // Controlla se esiste già una option con lo stesso optionLabel
      const existing = props.options.find(
        (option) => String(option[props.optionLabel]).toLowerCase() === newValue.toLowerCase(),
      )
      if (existing) {
        model.value = existing
      } else {
        model.value = props.formatter(newValue)
      }
    } else {
      // Se non c'è formatter, imposta comunque il valore stringa
      model.value = newValue as T | T[keyof T]
    }
  } else {
    model.value = newValue as T | T[keyof T]
  }
}

const mergedOptions = computed(() => {
  // Se il model è undefined o nullo, restituisci semplicemente le options
  if (model.value === undefined || model.value === null) {
    return props.options
  }

  // Se optionValue è definito, controlla se il valore è già presente tra le options
  if (props.optionValue) {
    const exists = props.options.some((option) => option[props.optionValue!] === model.value)
    if (!exists) {
      // Se il model è solo il valore (non l'oggetto), non possiamo aggiungere l'oggetto completo
      // quindi restituiamo comunque solo le options
      return props.options
    }
    return props.options
  }

  // Se optionValue non è definito, model.value dovrebbe essere l'oggetto completo
  const exists = props.options.some(
    (option) => option[props.optionLabel] === (model.value as T)[props.optionLabel],
  )
  if (!exists) {
    return [...props.options, model.value as T]
  }
  return props.options
})

//TODO qui si può pulire
const invalid = computed(() =>
  !props.readonly && props.validation ? !props.validation.valid : false,
)
</script>
