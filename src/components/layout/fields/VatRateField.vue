<template>
  <SelectField
    v-model="model"
    :inputId
    :label
    :readonly
    :validation
    :showClear
    :options="VAT_RATES"
    optionValue="value"
    optionLabel="label"
  />
</template>

<script setup lang="ts">
import SelectField from '@/components/layout/fields/SelectField.vue'

const model = defineModel<number | undefined>()

interface VatRate extends Record<string, unknown> {
  readonly label: string
  readonly value: number
}

interface VatRateFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  validation?: { message?: string; valid: boolean }
  showClear?: boolean
}

defineProps<VatRateFieldProps>()

// Costanti per le aliquote IVA
const VAT_RATES: VatRate[] = [
  { label: '0%', value: 0 },
  { label: '4%', value: 4 },
  { label: '22%', value: 22 },
]
</script>
