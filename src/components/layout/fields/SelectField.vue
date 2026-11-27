<template>
  <InputValidationField :inputId :label :invalid :error="validation?.message">
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
      class="p-inputwrapper-filled w-full"
      fluid
    >
      <template v-if="optionSeverity" #option="{ option }">
        <Tag
          :value="String(option[optionLabel])"
          :severity="optionSeverity(option) as TagProps['severity']"
        />
      </template>
      <template v-else-if="optionDepth || optionDetail" #option="{ option }">
        <span :style="{ paddingLeft: `${(optionDepth?.(option) ?? 0) * 1.25}rem` }">
          {{ option[optionLabel]
          }}<template v-if="optionDetail?.(option)"> - {{ optionDetail(option) }}</template>
        </span>
      </template>
      <template v-if="optionSeverity" #value="{ value: selected }">
        <Tag
          v-if="selectedOption(selected)"
          :value="String(selectedOption(selected)![optionLabel])"
          :severity="optionSeverity(selectedOption(selected)!) as TagProps['severity']"
        />
        <span v-else>&nbsp;</span>
      </template>
    </Select>
  </InputValidationField>
</template>

<script setup lang="ts" generic="T extends object">
import { computed } from 'vue'
import { InputText, Select, Tag, type TagProps } from 'primevue'
import InputValidationField from '@/components/layout/fields/InputValidationField.vue'

interface SelectFieldProps<T extends object> {
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
  optionSeverity?: (option: T) => string | undefined
  optionDepth?: (option: T) => number
  optionDetail?: (option: T) => string | undefined
  formatter?: (value: string) => T | T[keyof T]
}

const props = defineProps<SelectFieldProps<T>>()

const model = defineModel<T | T[keyof T]>()

const selectedOption = (selected: unknown): T | undefined =>
  props.optionValue
    ? props.options.find((option) => option[props.optionValue!] === selected)
    : (selected as T | undefined)

const value = computed(() => {
  if (model.value === undefined || model.value === null) return ''

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
