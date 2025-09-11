<template>
  <InputText
    v-if="readonly"
    :id="inputId"
    :value="value"
    :fluid
    readonly
    class="p-filled" />
  <Select v-else
          :modelValue="model"
          @update:modelValue="onSelect"
          :options="tmpModel ? [ ...options, tmpModel] : options"
          :inputId
          :optionLabel="optionLabel as string"
          :showClear
          :editable
          :loading
          class="p-inputwrapper-filled" :fluid />
</template>

<script setup lang="ts" generic="
  T extends Partial<Record<string, unknown>>,
  K extends keyof T,
  L extends keyof T
">

import { computed, ref, type Ref, watch } from 'vue'
import { InputText, Select } from 'primevue'

interface ComboBoxProps<T extends Partial<Record<string, unknown>>, K extends keyof T, L extends keyof T> {
  editable?: boolean;
  fluid?: boolean;
  options: T[];
  inputId?: string;
  optionId: K;
  optionLabel: L;
  showClear?: boolean;
  loading?: boolean;
}

const props = defineProps<ComboBoxProps<T, K, L>>()
const readonly = computed(() => !props.editable)

const model = defineModel<T | undefined>()
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
    const existing = props.options.find((t) => {
      const labelValue = t[props.optionLabel]
      return typeof labelValue === 'string' && labelValue.toLowerCase() === v.toLowerCase()
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
</script>
