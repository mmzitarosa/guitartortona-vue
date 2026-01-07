import { computed, ref } from 'vue'
import type { FormOptions } from '@/types/form'
import { type ConfirmDialogParams, useConfirmDialog } from '@/composables/useConfirmDialog'
import { useOriginalData } from '@/composables/useOriginalData'
import { getNestedValue } from '@/utils/object'
import { useConfirmDialogConstants } from '@/utils/i18nConstants'

export function useForm<T extends { id?: number }, R = T>(options: FormOptions<T, R>) {
  const {
    initialValue,
    getById,
    create,
    update,
    complete,
    remove,
    fieldMappings,
    group,
    mapResponse,
  } = options
  const confirmDialog = useConfirmDialog()
  const constants = useConfirmDialogConstants()

  // Usa il nuovo composable per gestire item, original, changes, dirty, pristine
  const {
    item,
    changes,
    dirty,
    pristine,
    reset: resetItem,
    resetOriginal,
    setOriginal,
    existingItem,
  } = useOriginalData<T>({
    initialValue,
    fieldMappings,
  })

  const loading = ref(false)
  const validate = ref(false)

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loading.value = true
    try {
      return await fn()
    } finally {
      loading.value = false
    }
  }

  const requireConfirm = <T>(params: ConfirmDialogParams<T>) =>
    withLoading(() => confirmDialog.require<T>(params))

  const executeAndReset = async (action: () => Promise<R | void>) => {
    // Chiamo servizio di insert
    const result = await action()

    // L'esito è il mio nuovo item, resetto anche l'original per poi fare i confronti
    // Se void (come per delete) resetto l'original ai valori iniziali
    if (result === undefined) resetItem()
    else if (mapResponse) {
      // Se c'è una funzione mapResponse, la uso per trasformare R in T
      setOriginal(mapResponse(result))
    }
    // Disattivo la validazione, verrà riattivata all'eventuale prossimo submit
    validate.value = false
    return result ?? true
  }

  const loadItem = (id: number) =>
    withLoading(async (): Promise<T | undefined> => {
      if (!getById) return
      const result = await getById(id)
      setOriginal(result)
      return result
    })

  const validation = computed(() => {
    let allValid = true
    const fields = Object.fromEntries(
      fieldMappings.map(({ key, validator }) => {
        const rawResult = validator ? validator(getNestedValue(item.value, key)) : undefined
        const isFieldValid = !rawResult
        if (!isFieldValid) allValid = false

        return [
          key,
          {
            message: rawResult?.message,
            validate: validate.value,
            _valid: isFieldValid,
            valid: !validate.value || isFieldValid,
          },
        ]
      }),
    )

    return {
      fields,
      validate: validate.value,
      _valid: allValid,
      valid: !validate.value || allValid,
    }
  })

  const handleSubmit = () => {
    const isUpdate = existingItem.value
    const canExecute = isUpdate ? !!update : !!create
    if (!canExecute) return

    // Al primo submit attivo la validazione del form,
    // poi rimane attivo fino all'esito, close o reset
    validate.value = true
    // Controllo che i campi del form siano validi, in caso negativo
    // non faccio nulla perché la validazione è attiva e i campi evidenziati
    if (!validation.value.valid) return

    // Preparo il dialog di update (se esiste id) o insert (nuovo item)
    const config = isUpdate ? constants.updateDialog : constants.saveDialog
    const accept = () =>
      isUpdate ? update!(item.value.id as number, item.value) : create!(item.value)

    return requireConfirm({
      header: config.title,
      message: config.message,
      group: group ?? 'differences',
      icon: config.icon,
      acceptLabel: config.acceptLabel,
      toastSummary: config.toastTitle,
      toastDetail: config.toastMessage,
      accept: () => executeAndReset(accept),
    })
  }

  const handleComplete = () => {
    if (!complete) return
    return requireConfirm({
      header: constants.completeDialog.title,
      message: constants.completeDialog.message,
      icon: constants.completeDialog.icon,
      acceptLabel: constants.completeDialog.acceptLabel,
      toastSummary: constants.completeDialog.toastTitle,
      toastDetail: constants.completeDialog.toastMessage,
      accept: () => executeAndReset(() => complete(item.value.id as number)),
    })
  }

  const handleReset = () =>
    requireConfirm({
      header: constants.resetDialog.title,
      message: constants.resetDialog.message,
      icon: constants.resetDialog.icon,
      acceptLabel: constants.resetDialog.acceptLabel,
      toastSummary: constants.resetDialog.toastTitle,
      toastDetail: constants.resetDialog.toastMessage,
      accept: async () => {
        resetItem()
        validate.value = false
        return true
      },
    })

  const handleClose = () => {
    if (pristine.value) return true
    return requireConfirm({
      header: constants.cancelDialog.title,
      message: constants.cancelDialog.message,
      icon: constants.cancelDialog.icon,
      acceptLabel: constants.cancelDialog.acceptLabel,
      toastSummary: constants.cancelDialog.toastTitle,
      toastDetail: constants.cancelDialog.toastMessage,
      accept: async () => {
        resetItem()
        validate.value = false
        return true
      },
    })
  }

  const handleDelete = () => {
    if (!remove) return
    return requireConfirm({
      header: constants.deleteDialog.title,
      message: constants.deleteDialog.message,
      icon: constants.deleteDialog.icon,
      acceptLabel: constants.deleteDialog.acceptLabel,
      toastSummary: constants.deleteDialog.toastTitle,
      toastDetail: constants.deleteDialog.toastMessage,
      accept: () => executeAndReset(() => remove(item.value.id as number)),
    })
  }

  return {
    item,
    loading,
    changes,
    dirty,
    pristine,
    loadItem,
    setItem: setOriginal,
    resetOriginal,
    existingItem,
    validation,
    handleSubmit,
    handleComplete,
    handleReset,
    handleClose,
    handleDelete,
    withLoading,
  }
}
