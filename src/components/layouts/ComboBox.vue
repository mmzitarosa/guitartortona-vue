<template>
  <InputField :inputId :label :invalid :error="validation?.message">

    <InputText v-if="readonly" :value="value"
               :id="inputId"
               readonly fluid
               class="p-filled" />

    <Select v-else :modelValue="model"
            @update:modelValue="onSelect"
            :inputId :editable :loading :invalid
            :options="tmpModel ? [ ...options, tmpModel].sort((a, b) => a.name.localeCompare(b.name)) : options"
            :optionLabel="optionLabel as string" showClear
            class="p-inputwrapper-filled" fluid/>

  </InputField>

</template>

<script setup lang="ts" generic="T extends Record<string,any>">

import { computed, ref, type Ref, watch } from 'vue'
import { InputText, Select } from 'primevue'
import InputField from '@/components/layouts/InputField.vue'

interface ComboBoxProps<T extends Record<string, any>> {
  inputId: string;
  label: string,
  editable?: boolean;
  readonly?: boolean;
  options: T[];
  optionId: keyof T;
  optionLabel: keyof T;
  loading?: boolean;
  validation?: { message?: string, valid: boolean };
}

const props = defineProps<ComboBoxProps<T>>()

const model = defineModel<T>()
const tmpModel: Ref<T | undefined> = ref(undefined)

const value = computed(() => {
  const modelValue = model?.value
  if (!modelValue) return ''
  const value = modelValue[props.optionLabel]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
})

watch(model, (value: T | undefined) => {
  // Quando cambia il value, resetto il modello temporaneo (mi evito eventuali duplicati)
  if (tmpModel.value && value && value[props.optionId])
    tmpModel.value = undefined
})

// Funzione che gestisce la selezione / scrittura
function onSelect(v: T | string | undefined) {
  if (typeof v === 'string') {
    // Input manuale
    // Controllo se già esiste
    const existing = props.options.find((t: T) => {
      return t[props.optionLabel].toLowerCase() === v.toLowerCase()
    })

    if (existing) {
      // Se già esiste, utilizzo il valore esistente
      tmpModel.value = undefined
      model.value = existing
    } else {
      // Se non esiste, credo oggetto oggetto parziale
      tmpModel.value = { [props.optionLabel]: v } as T
      model.value = tmpModel.value
    }
  } else if (v) {
    // Input da selezione, controllo se l'item selezionato è in lista
    tmpModel.value = props.options.some((t: T) => t[props.optionId] === v[props.optionId]) ? undefined : v
    model.value = v
  } else {
    tmpModel.value = undefined
    model.value = undefined
  }
}

//TODO qui si può pulire
const invalid = computed(() => !props.readonly && props.validation ? !props.validation.valid : false)

</script>
