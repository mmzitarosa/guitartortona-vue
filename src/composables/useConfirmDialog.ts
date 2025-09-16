import { useConfirm, useToast } from 'primevue'

export interface ConfirmDialogParams<T> {
  header: string,
  message: string,
  group?: string
  icon: string,
  acceptLabel: string,
  rejectLabel?: string,
  acceptSeverity?: 'primary' | 'contrast'
  rejectSeverity?: 'primary' | 'contrast'
  toastSummary: string,
  toastDetail: string,
  accept: () => T | Promise<T>
}

export const useConfirmDialog = () => {

  const toast = useToast()
  const confirm = useConfirm()

  const require = <T>(params: ConfirmDialogParams<T>): Promise<T> => {
    return new Promise<T>((resolve, error) => {
      confirm.require({
        header: params.header,
        message: params.message,
        group: params.group,
        icon: params.icon,
        acceptProps: { label: params.acceptLabel, severity: params.acceptSeverity, text: true },
        rejectProps: { label: params.rejectLabel ?? 'Chiudi', severity: params.rejectSeverity ?? 'secondary', text: true },
        accept: async () => {
          try {
            console.log("Accepted")
            const result = await params.accept()
            toast.add({
              severity: 'success',
              summary: params.toastSummary,
              detail: params.toastDetail,
              life: 3000
            })
            console.log("resolved")
            resolve(result)
          } catch (err: any) {
            toast.add({
              severity: 'error',
              summary: err?.name || 'Errore',
              detail: err?.message || 'Si è verificato un errore',
              life: 6000
            })
            error(err)
          }
        }
      })
    })
  }

  return { require }

}
