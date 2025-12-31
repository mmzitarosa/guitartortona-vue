import { computed, type ComputedRef, ref, type Ref, toRaw } from 'vue'
import type { FieldMapping } from '@/types/form'
import { getNestedValue } from '@/utils/object'

export interface UseOriginalDataOptions<T> {
  initialValue?: T
  fieldMappings: FieldMapping<T>[]
}

export interface FieldChange {
  field: string
  oldValue: any
  newValue: any
  ignore: boolean
}

export function useOriginalData<T extends { id?: number }>(options: UseOriginalDataOptions<T>) {
  const { initialValue, fieldMappings } = options

  const clone = (val: T) => structuredClone(toRaw(val))
  const initial = initialValue ? clone(initialValue) : ({} as T)

  // L'item corrente - parte con initialValue se presente
  const item = ref(clone(initial)) as Ref<T>
  const original = ref(clone(initial)) as Ref<T>

  const isExistingItem = computed(() => !!item.value.id)

  const computeFieldChange = (mapping: FieldMapping<T>): FieldChange | null => {
    const { key, label: fieldLabel, labeler, defaultValue } = mapping

    const oldRaw = getNestedValue(original.value, key)
    const newRaw = getNestedValue(item.value, key)

    const oldValue = labeler ? labeler(oldRaw) : oldRaw
    const newValue = labeler ? labeler(newRaw) : newRaw

    const isUnchangedDefault = !isExistingItem.value && oldValue === newValue && !!defaultValue
    const hasChanged = oldValue !== newValue

    if (isUnchangedDefault || hasChanged) {
      return { field: fieldLabel, oldValue, newValue, ignore: isUnchangedDefault }
    }
    return null
  }

  const changes: ComputedRef<FieldChange[]> = computed(() => {
    if (!item.value || !original.value) return []
    return fieldMappings
      .map(computeFieldChange)
      .filter((change): change is FieldChange => change !== null)
  })

  const dirty = computed(() => changes.value.some((change) => !change.ignore))
  const pristine = computed(() => !dirty.value)

  const reset = () => {
    item.value = clone(original.value)
  }

  const resetOriginal = () => {
    original.value = clone(initial)
    item.value = clone(initial)
  }

  const setOriginal = (value: T) => {
    original.value = clone(value)
    item.value = clone(value)
  }

  return {
    item,
    changes,
    dirty,
    pristine,
    existingItem: isExistingItem,
    reset,
    setOriginal,
    resetOriginal,
  }
}
