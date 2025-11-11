import { computed, ref, type Ref } from 'vue'
import type { SubmitFormOptions } from '@/types/form'
import { getNestedValue } from '@/utils/object'

export interface FromDateToDate {
  fromDate?: string
  toDate?: string
}

export function useSearchForm<T>(options: SubmitFormOptions<T, { from?: string; to?: string }>) {
  const { fieldMappings, onSubmit } = options

  const item: Ref<T> = ref({}) as Ref<T>
  const validate = ref(false)

  const validation = computed(() => {
    const fieldResults = {} as Record<
      string,
      { message?: string; _valid: boolean; validate: boolean; valid: boolean }
    >

    let valid = true

    for (const { key, validator } of fieldMappings) {
      const rawValue = getNestedValue(item.value as Record<string, unknown>, key)
      const rawResult = validator ? validator(rawValue) : undefined
      const validationResult = {
        message: rawResult?.message, // Messaggio da mostrare
        validate: validate.value, // Validazione attiva
        _valid: !rawResult, // Esito della validazione
        valid: !validate.value || !rawResult, // Stato da mostrare
      }
      fieldResults[key] = validationResult
      if (!validationResult._valid) valid = false
    }

    return {
      fields: fieldResults,
      validate: validate.value,
      _valid: valid,
      valid: !validate.value || valid,
    }
  })

  const handleSubmit = () => {
    // Al primo submit attivo la validazione del form,
    // poi rimane attivo fino all'esito, close o reset
    validate.value = true
    // Controllo che i campi del form siano validi, in caso negativo
    // non faccio nulla perché la validazione è attiva e i campi evidenziati
    if (!validation.value.valid) return

    const result = onSubmit(item.value)
    validate.value = false

    return result
  }

  const handleReset = () => {
    item.value = {} as T
    validate.value = false
  }

  return {
    item,
    validation,
    handleSubmit,
    handleReset,
  }
}
