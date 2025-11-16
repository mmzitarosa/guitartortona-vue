import { computed, ref } from 'vue'
import { type ConfirmDialogParams, useConfirmDialog } from '@/composables/useConfirmDialog.ts'
import type { FormOptions } from '@/types/form'
import { useConfirmDialogConstants } from '@/utils/i18nConstants'
import { useOriginalData } from '@/composables/useOriginalData'
import { getNestedValue } from '@/utils/object.ts'

export function useForm<T extends { id?: number }>(options: FormOptions<T>) {
  const { initialValue, getById, create, update, complete, remove, fieldMappings, group } = options

  const confirmDialog = useConfirmDialog()
  const constants = useConfirmDialogConstants()

  // Usa il nuovo composable per gestire item, original, changes, dirty, pristine
  const {
    item,
    changes,
    dirty,
    pristine,
    reset: resetOriginalData,
    setOriginal,
    existingItem,
  } = useOriginalData<T>({
    initialValue,
    fieldMappings,
  })

  const loading = ref(false)
  const validate = ref(false)

  const loadItem = async (id: number) => {
    // Attivo il loading --> uno unico loading per tutto
    loading.value = true
    try {
      // Chiamo servizio di update
      const result = await getById(id)
      // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
      setOriginal(result)
      return result
    } finally {
      // In ogni caso, al termine, disattivo il loading
      loading.value = false
    }
  }

  const validation = computed(() => {
    const fieldResults = {} as Record<
      string,
      { message?: string; _valid: boolean; validate: boolean; valid: boolean }
    >

    let valid = true

    for (const { key, validator } of fieldMappings) {
      const rawResult = validator ? validator(getNestedValue(item.value, key)) : undefined
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

    try {
      // Attivo il loading --> uno unico loading per tutto
      loading.value = true
      // Preparo il dialog di update (se esiste id) o insert (nuovo item)
      const params: ConfirmDialogParams<T> = existingItem.value
        ? {
            header: constants.updateDialog.title,
            message: constants.updateDialog.message,
            group: group ?? 'differences', // Così mostra le diff rispetto al precedente
            icon: 'pi pi-info-circle',
            acceptLabel: constants.updateDialog.acceptLabel,
            toastSummary: constants.updateDialog.toastTitle,
            toastDetail: constants.updateDialog.toastMessage,
            accept: async () => {
              // Chiamo servizio di update
              const result = await update(<number>item.value.id, item.value)
              // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
              setOriginal(result)
              // Disattivo la validazione, verrà riattivata all'eventuale prossimo submit
              validate.value = false
              return result
            },
          }
        : {
            header: constants.saveDialog.title,
            message: constants.saveDialog.message,
            group: group ?? 'differences', // Così mostra le diff rispetto al precedente
            icon: 'pi pi-info-circle',
            acceptLabel: constants.saveDialog.acceptLabel,
            toastSummary: constants.saveDialog.toastTitle,
            toastDetail: constants.saveDialog.toastMessage,
            accept: async () => {
              // Chiamo servizio di insert
              const result = await create(item.value)
              // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
              setOriginal(result)
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

  const handleComplete = () => {
    try {
      // Attivo il loading --> uno unico loading per tutto
      loading.value = true
      const params: ConfirmDialogParams<T> = {
        header: 'title',
        message: 'message',
        icon: 'pi pi-info-circle',
        acceptLabel: 'acceptLabel',
        toastSummary: 'toastTitle',
        toastDetail: 'toastMessage',
        accept: async () => {
          // Chiamo servizio di confirm
          const result = await complete!(<number>item.value.id)
          // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
          setOriginal(result)
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
        header: constants.resetDialog.title,
        message: constants.resetDialog.message,
        icon: 'pi pi-exclamation-circle',
        acceptLabel: constants.resetDialog.acceptLabel,
        toastSummary: constants.resetDialog.toastTitle,
        toastDetail: constants.resetDialog.toastMessage,
        accept: async () => {
          resetOriginalData()
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
        header: constants.cancelDialog.title,
        message: constants.cancelDialog.message,
        icon: 'pi pi-exclamation-circle',
        acceptLabel: constants.cancelDialog.acceptLabel,
        toastSummary: constants.cancelDialog.toastTitle,
        toastDetail: constants.cancelDialog.toastMessage,
        accept: async () => {
          resetOriginalData()
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
    try {
      // Attivo il loading --> uno unico loading per tutto
      loading.value = true
      const params: ConfirmDialogParams<void> = {
        header: constants.deleteDialog.title,
        message: constants.deleteDialog.message,
        icon: 'pi pi-exclamation-circle',
        acceptLabel: constants.deleteDialog.acceptLabel,
        toastSummary: constants.deleteDialog.toastTitle,
        toastDetail: constants.deleteDialog.toastMessage,
        accept: async () => {
          await remove(item.value.id as number)
          resetOriginalData()
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
    setItem: setOriginal,
    existingItem,
    validation,
    handleSubmit,
    handleComplete,
    handleReset,
    handleClose,
    handleDelete,
  }
}
