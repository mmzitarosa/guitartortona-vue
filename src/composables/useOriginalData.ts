import { computed, type ComputedRef, ref, type Ref, toRaw } from 'vue'
import type { FieldMapping } from '@/types/form'
import { getNestedValue } from '@/utils/object.ts'

export interface UseOriginalDataOptions<T> {
  initialValue?: T
  fieldMappings: FieldMapping<T>[]
}

export function useOriginalData<T extends { id?: number }>(options: UseOriginalDataOptions<T>) {
  const { initialValue, fieldMappings } = options

  // L'item corrente - parte con initialValue se presente
  const item: Ref<T> = ref({ ...initialValue ?? {} }) as Ref<T>

  // Il valore originale con cui confrontare - parte SENZA initialValue
  const original: Ref<T> = ref({ ...initialValue ?? {} }) as Ref<T>

  const existingItem = computed(() => !!item.value.id)

  // Calcolo delle differenze tra item e original
  const changes: ComputedRef<{ field: string; oldValue: any; newValue: any, ignore: boolean }[]> = computed(() => {
    if (!item.value || !original.value) return []

    return fieldMappings.flatMap(({ key, label: field, labeler, defaultValue }) => {
      const oldRaw = getNestedValue(original.value, key)
      const newRaw = getNestedValue(item.value, key)

      const oldValue = labeler ? labeler(oldRaw) : oldRaw
      const newValue = labeler ? labeler(newRaw) : newRaw

      const ignore = !existingItem.value && oldValue === newValue && !!defaultValue

      if (ignore || oldValue !== newValue) {
        return [{ field, oldValue, newValue, ignore }]
      }
      return []
    })
  })

  // L'item è stato modificato rispetto all'original
  const dirty: ComputedRef<boolean> = computed(() => {
    return changes.value.some(change => !change.ignore)
  })

  // L'item è ancora vergine (non modificato)
  const pristine: ComputedRef<boolean> = computed(() => !dirty.value)

  // Reset dell'item
  const reset = () => {
    item.value = structuredClone(toRaw(original.value))
  }

  // Aggiorna l'original con un nuovo valore (es. dopo il caricamento o salvataggio)
  const setOriginal = (value: T) => {
    original.value = structuredClone(value)
    item.value = structuredClone(value)
  }

  return {
    item,
    changes,
    dirty,
    pristine,
    existingItem,
    reset,
    setOriginal,
  }
}
