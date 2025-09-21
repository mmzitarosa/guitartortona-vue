import { computed, type ComputedRef, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { type ConfirmDialogParams, useConfirmDialog } from '@/composables/useConfirmDialog.ts'
import type { FormOptions } from '@/types/form'

export function useForm<T extends { id?: number }>(options: FormOptions<T>) {
  const { getById, create, update, remove, fieldMappings } = options

  const confirmDialog = useConfirmDialog()
  const { t } = useI18n()

  const item: Ref<T> = ref({}) as Ref<T>
  const original: Ref<T> = ref({}) as Ref<T>
  const loading = ref(false)
  const validate = ref(false)

  const newItem = computed(() => !item.value.id)
  const existingItem = computed(() => !!item.value.id)

  const loadItem = async (id: number) => {
    // Attivo il loading --> uno unico loading per tutto
    loading.value = true
    try {
      // Chiamo servizio di update
      const result = await getById(id)
      // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
      item.value = result
      original.value = { ...result }
      return result
    } finally {
      // In ogni caso, al termine, disattivo il loading
      loading.value = false
    }
  }

  const changes: ComputedRef<{ field: string; oldValue: any; newValue: any }[]> = computed(() => {
    if (!item.value || !original.value) return []
    return fieldMappings.flatMap(({ key, label, getter, labeler }) => {
      const oldVal = getter ? getter(original.value[key]) : original.value[key]
      const newVal = getter ? getter(item.value[key]) : item.value[key]

      if (oldVal !== newVal) {
        const oldLabel = labeler ? labeler(original.value[key]) : original.value[key]
        const newLabel = labeler ? labeler(item.value[key]) : item.value[key]
        return [{ field: label, oldValue: oldLabel, newValue: newLabel }]
      }
      return []
    })
  })

  const validation = computed(() => {
    const fieldResults = {} as Record<
      keyof T,
      { message?: string; _valid: boolean; validate: boolean; valid: boolean }
    >

    let valid = true

    for (const { key, validator } of fieldMappings) {
      const rawResult = validator ? validator(item.value[key]) : undefined
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

  const dirty: ComputedRef<boolean> = computed(() => {
    return changes.value.length > 0
  })

  const pristine: ComputedRef<boolean> = computed(() => !dirty.value)

  const handleSubmit = () => {
    // Al primo submit attivo la validazione del form,
    // poi rimane attivo fino all'esito, close o reset
    validate.value = true
    // Controllo che i campi del form siano validi, in caso negativo
    // non faccio nulla perché la validazione è attiva e i campi evidenziati
    if (!validation.value.valid) return

    try {
      // Attivo il loading --> uno unico loading per tutto
      loading.value = true
      // Preparo il dialog di update (se esiste id) o insert (nuovo item)
      const params: ConfirmDialogParams<T> = existingItem.value
        ? {
            header: t('form.dialog.update.header'),
            message: t('form.dialog.update.message'),
            group: 'differences', // Così mostra le diff rispetto al precedente
            icon: 'pi pi-info-circle',
            acceptLabel: t('form.dialog.update.acceptLabel'),
            toastSummary: t('form.dialog.update.toastSummary'),
            toastDetail: t('form.dialog.update.toastDetail'),
            accept: async () => {
              // Chiamo servizio di update
              const result = await update(<number>item.value.id, item.value)
              // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
              item.value = result
              original.value = { ...result }
              // Disattivo la validazione, verrà riattivata all'eventuale prossimo submit
              validate.value = false
              return result
            },
          }
        : {
            header: t('form.dialog.save.header'),
            message: t('form.dialog.save.message'),
            group: 'differences', // Così mostra le diff rispetto al precedente
            icon: 'pi pi-info-circle',
            acceptLabel: t('form.dialog.save.acceptLabel'),
            toastSummary: t('form.dialog.save.toastSummary'),
            toastDetail: t('form.dialog.save.toastDetail'),
            accept: async () => {
              // Chiamo servizio di insert
              const result = await create(item.value)
              // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
              item.value = result
              original.value = { ...result }
              // Disattivo la validazione, verrà riattivata all'eventuale prossimo submit
              validate.value = false
              return result
            },
          }
      // Apro il dialog
      return confirmDialog.require<T>(params)
    } finally {
      // In ogni caso, al termine, disattivo il loading
      loading.value = false
    }
  }

  const handleReset = () => {
    try {
      // Attivo il loading --> uno unico loading per tutto
      loading.value = true
      const params: ConfirmDialogParams<void> = {
        header: t('form.dialog.reset.header'),
        message: t('form.dialog.reset.message'),
        icon: 'pi pi-exclamation-circle',
        acceptLabel: t('form.dialog.reset.acceptLabel'),
        toastSummary: t('form.dialog.reset.toastSummary'),
        toastDetail: t('form.dialog.reset.toastDetail'),
        accept: async () => {
          item.value = { ...original.value }
          validate.value = false
        },
      }
      return confirmDialog.require<void>(params)
    } finally {
      // In ogni caso, al termine, disattivo il loading
      loading.value = false
    }
  }

  const handleClose = () => {
    if (pristine.value) return
    try {
      // Attivo il loading --> uno unico loading per tutto
      loading.value = true
      const params: ConfirmDialogParams<void> = {
        header: t('form.dialog.close.header'),
        message: t('form.dialog.close.message'),
        icon: 'pi pi-exclamation-circle',
        acceptLabel: t('form.dialog.close.acceptLabel'),
        toastSummary: t('form.dialog.close.toastSummary'),
        toastDetail: t('form.dialog.close.toastDetail'),
        accept: async () => {
          item.value = { ...original.value }
          validate.value = false
        },
      }
      return confirmDialog.require<void>(params)
    } finally {
      // In ogni caso, al termine, disattivo il loading
      loading.value = false
    }
  }

  const handleDelete = () => {
    //TODO Capire perché questo primo controllo non è sufficiente
    if (item.value.id === undefined || options.remove === undefined) return
    try {
      // Attivo il loading --> uno unico loading per tutto
      loading.value = true
      const params: ConfirmDialogParams<void> = {
        header: t('form.dialog.delete.header'),
        message: t('form.dialog.delete.message'),
        icon: 'pi pi-exclamation-circle',
        acceptLabel: t('form.dialog.delete.acceptLabel'),
        toastSummary: t('form.dialog.delete.toastSummary'),
        toastDetail: t('form.dialog.delete.toastDetail'),
        accept: async () => {
          await options.remove!(item.value.id as number)
          item.value = { ...original.value }
          validate.value = false
        },
      }
      return confirmDialog.require<void>(params)
    } finally {
      // In ogni caso, al termine, disattivo il loading
      loading.value = false
    }
  }

  return {
    item,
    loading,
    changes,
    dirty,
    pristine,
    loadItem,
    validation,
    handleSubmit,
    handleReset,
    handleClose,
    handleDelete,
  }
}
