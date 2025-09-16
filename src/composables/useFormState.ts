import { computed, type Ref } from 'vue'

export interface FormOptions {
  id?: string | number | null | undefined
  editable?: boolean
}

export function useFormState(options: FormOptions) {
  const readonly = computed(() => !options.editable)
  const editable = computed(() => options.editable)

  const newItem = computed(() => !options.id)
  const existingItem = computed(() => !!options.id)

  return {
    readonly,
    editable,
    newItem,
    existingItem
  }
}
