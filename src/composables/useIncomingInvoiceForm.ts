import { computed, type ComputedRef, ref } from 'vue'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'
import {
  deleteIncomingInvoiceById,
  getIncomingInvoiceById,
  postIncomingInvoice, putIncomingInvoiceById
} from '@/services/api/incomingInvoiceService.ts'
import { useConfirm, useToast } from 'primevue'
import { INCOMING_INVOICE } from '@/utils/constants.ts'
import type { Supplier } from '@/types/supplier.ts'

export const useIncomingInvoiceForm = () => {

  const constants = INCOMING_INVOICE

  const loading = ref(false)
  const confirm = useConfirm()
  const toast = useToast()

  const incomingInvoice = ref<IncomingInvoice>({})
  const incomingInvoiceOriginal = ref<IncomingInvoice>({})

  const fieldMappings: {
    key: keyof IncomingInvoice
    label: string
    getter?: (v: any) => unknown
    labeler?: (v: any) => unknown
  }[] =
    [
      { key: 'supplier', label: 'Fornitore', getter: (v: Supplier) => v ? v.id : undefined, labeler:  (v: Supplier) => v ? v.name : undefined },
      { key: 'date', label: 'Data' },
      { key: 'number', label: 'Numero' },
      {
        key: 'amount',
        label: 'Importo',
        labeler: (v: number) => v?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
      },
      { key: 'notes', label: 'Note' }
    ]

  const changes: ComputedRef<{ field: string, oldValue: any, newValue: any }[]> = computed(() => {
    //Confronto l'oggetto incomingInvoice con l'originale
    return fieldMappings.flatMap(({ key, label, getter, labeler }) => {
      const oldVal = getter ? getter(incomingInvoiceOriginal.value[key]) : incomingInvoiceOriginal.value[key]
      const newVal = getter ? getter(incomingInvoice.value[key]) : incomingInvoice.value[key]

      if (oldVal !== newVal) {
        const oldLabel = labeler ? labeler(incomingInvoiceOriginal.value[key]) : incomingInvoiceOriginal.value[key]
        const newLabel = labeler ? labeler(incomingInvoice.value[key]) : incomingInvoice.value[key]
        return [{ field: label, oldValue: oldLabel, newValue: newLabel }]
      }
      return []
    })
  })

  const hasChanges: ComputedRef<boolean> = computed(() => {
    return changes.value.length > 0
  })

  const isUpdate = computed(() => incomingInvoice.value?.id !== undefined)

  const handleSubmit = () => {
    return new Promise<IncomingInvoice>((resolve, error) => {
      const dialogConstants = isUpdate.value ? constants.updateDialog : constants.saveDialog
      confirm.require({
        header: dialogConstants?.title,
        group: 'differences',
        message: dialogConstants?.message,
        icon: dialogConstants?.icon,
        rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
        acceptProps: { label: dialogConstants?.acceptLabel, text: true },
        accept: () => {
          (isUpdate.value ? updateIncomingInvoice(incomingInvoice.value.id as number) : createIncomingInvoice()).then(
            result => {
              incomingInvoice.value = result
              incomingInvoiceOriginal.value = { ...result }
              toast.add({
                severity: 'success',
                summary: dialogConstants?.toastTitle,
                detail: dialogConstants?.toastMessage,
                life: 3000
              })
              resolve(result)
            }, e => {
              toast.add({ severity: 'error', summary: e.name, detail: e.message, life: 3000 })
              error(e)
            }
          )
        }
      })
    })
  }

  const handleReset = () => {
    return new Promise<void>((resolve) => {
      const dialogConstants = constants.resetDialog
      confirm.require({
        header: dialogConstants?.title,
        message: dialogConstants?.message,
        icon: dialogConstants?.icon,
        rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
        acceptProps: { label: dialogConstants?.acceptLabel, severity: 'contrast', text: true },
        accept: () => {
          incomingInvoice.value = { ...incomingInvoiceOriginal.value }
          toast.add({
            severity: 'success',
            summary: dialogConstants?.toastTitle,
            detail: dialogConstants?.toastMessage,
            life: 3000
          })
          resolve()
        }
      })
    })
  }

  const handleClose = () => {
    return new Promise<void>((resolve) => {
      const dialogConstants = constants.cancelDialog
      if (!hasChanges.value) {
        resolve()
      } else {
        confirm.require({
          header: dialogConstants?.title,
          message: dialogConstants?.message,
          icon: dialogConstants?.icon,
          rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
          acceptProps: { label: dialogConstants?.acceptLabel, severity: 'contrast', text: true },
          accept: () => {
            toast.add({
              severity: 'success',
              summary: dialogConstants?.toastTitle,
              detail: dialogConstants?.toastMessage,
              life: 3000
            })
            resolve()
          }
        })
      }
    })
  }

  const handleDelete = () => {
    return new Promise<void>((resolve, error) => {
      const dialogConstants = constants.deleteDialog
      confirm.require({
        header: dialogConstants?.title,
        message: dialogConstants?.message,
        icon: dialogConstants?.icon,
        rejectProps: { label: dialogConstants?.rejectLabel, severity: 'secondary', text: true },
        acceptProps: { label: dialogConstants?.acceptLabel, severity: 'contrast', text: true },
        accept: () => {
          if (!incomingInvoice.value.id) return
          deleteIncomingInvoice(incomingInvoice.value.id).then(
            () => {
              toast.add({
                severity: 'success',
                summary: dialogConstants?.toastTitle,
                detail: dialogConstants?.toastMessage,
                life: 3000
              })
              resolve()
            }, e => {
              toast.add({ severity: 'error', summary: e.name, detail: e.message, life: 3000 })
              error(e)
            }
          )
        }
      })
    })
  }

  const loadIncomingInvoice = async (id: number) => {
    loading.value = true
    try {
      incomingInvoice.value = await getIncomingInvoiceById(id)
      incomingInvoiceOriginal.value = { ...incomingInvoice.value }
    } finally {
      loading.value = false
    }
    return incomingInvoice.value
  }

  const createIncomingInvoice = () => {
    loading.value = true
    return new Promise<IncomingInvoice>(async (resolve, error) => {
      try {
        resolve(await postIncomingInvoice(incomingInvoice.value))
      } catch (e) {
        error(e)
      } finally {
        loading.value = false
      }
    })
  }

  const updateIncomingInvoice = (id: number) => {
    loading.value = true
    return new Promise<IncomingInvoice>(async (resolve, error) => {
      try {
        resolve(await putIncomingInvoiceById(id, incomingInvoice.value))
      } catch (e) {
        error(e)
      } finally {
        loading.value = false
      }
    })
  }

  const deleteIncomingInvoice = (id: number) => {
    loading.value = true
    return new Promise<void>(async (resolve, error) => {
      try {
        await deleteIncomingInvoiceById(id)
        resolve()
      } catch (e) {
        error(e)
      } finally {
        loading.value = false
      }
    })
  }


  return {
    incomingInvoice,
    loadIncomingInvoice,
    changes,
    hasChanges,
    loading,
    handleSubmit,
    handleReset,
    handleClose,
    handleDelete
  }

}


//{"supplier":{"props":{"name":"supplier","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"supplier","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"date":{"props":{"name":"date","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"date","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"number":{"props":{"name":"number","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"number","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"amount":{"props":{"name":"amount","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"amount","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"notes":{"props":{"name":"notes","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"notes","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}}}
//{"supplier":{"props":{"name":"supplier","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"supplier","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"date":{"props":{"name":"date","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"date","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"number":{"props":{"name":"number","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"number","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"amount":{"props":{"name":"amount","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":123,"touched":true,"dirty":true,"pristine":false,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"amount","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}},"notes":{"props":{"name":"notes","onBlur":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onBlur()</span>","tooltipText":"<pre>function onBlur() {\n        _states[field2].touched = true;\n        validateFieldOn(field2, fieldOptions, \"validateOnBlur\");\n      }</pre>"}},"onInput":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInput(event)</span>","tooltipText":"<pre>function onInput(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.value;\n      }</pre>"}},"onChange":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onChange(event)</span>","tooltipText":"<pre>function onChange(event) {\n        _states[field2].value = event && Object.hasOwn(event, \"value\") ? event.value : event.target.type === \"checkbox\" || event.target.type === \"radio\" ? event.target.checked : event.target.value;\n      }</pre>"}},"onInvalid":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">onInvalid(errors)</span>","tooltipText":"<pre>function onInvalid(errors) {\n        var _errors$;\n        _states[field2].invalid = true;\n        _states[field2].errors = errors;\n        _states[field2].error = (_errors$ = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _errors$ !== void 0 ? _errors$ : null;\n      }</pre>"}}},"states":{"_custom":{"type":"reactive","stateTypeName":"Reactive","value":{"value":null,"touched":false,"dirty":false,"pristine":true,"valid":true,"invalid":false,"error":null,"errors":[]}}},"options":{"name":"notes","resolver":"__vue_devtool_undefined__","initialValue":"__vue_devtool_undefined__","validateOnValueUpdate":"__vue_devtool_undefined__","validateOnBlur":"__vue_devtool_undefined__","validateOnMount":"__vue_devtool_undefined__","validateOnSubmit":"__vue_devtool_undefined__"},"_watcher":{"stop":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">watchHandle()</span>","tooltipText":"<pre>() => {\n    effect2.stop();\n    if (scope && scope.active) {\n      remove(scope.effects, effect2);\n    }\n  }</pre>"}},"pause":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">pause()</span>","tooltipText":"<pre>function pause() {\n      isActive.value = false;\n    }</pre>"}},"resume":{"_custom":{"type":"function","displayText":"<span style=\"opacity:.8;margin-right:5px;\">function</span> <span style=\"white-space:nowrap;\">resume()</span>","tooltipText":"<pre>function resume() {\n      isActive.value = true;\n    }</pre>"}}}}}
