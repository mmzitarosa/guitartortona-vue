import { useToast } from 'primevue'

/**
 * Error handling utility
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Global error handler
 */
export const useErrorHandler = () => {
  const toast = useToast()

  const handleError = (error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error)

    let message = 'Si è verificato un errore imprevisto'
    let summary = 'Errore'

    if (error instanceof AppError) {
      message = error.message
      summary = error.code || 'Errore'
    } else if (error instanceof Error) {
      message = error.message
      summary = error.name || 'Errore'
    } else if (typeof error === 'string') {
      message = error
    }

    toast.add({
      severity: 'error',
      summary,
      detail: message,
      life: 6000,
    })
  }

  const handleApiError = (error: any) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        handleError(
          new AppError('Sessione scaduta. Effettua nuovamente il login.', 'AUTH_ERROR', 401),
        )
        // TODO: Redirect to login
      } else if (status === 403) {
        handleError(
          new AppError('Non hai i permessi per eseguire questa operazione.', 'FORBIDDEN', 403),
        )
      } else if (status === 404) {
        handleError(new AppError('Risorsa non trovata.', 'NOT_FOUND', 404))
      } else if (status >= 500) {
        handleError(new AppError('Errore del server. Riprova più tardi.', 'SERVER_ERROR', status))
      } else {
        handleError(new AppError(data?.message || 'Errore nella richiesta', 'API_ERROR', status))
      }
    } else if (error.request) {
      // Request was made but no response received
      handleError(
        new AppError(
          'Impossibile connettersi al server. Verifica la connessione.',
          'NETWORK_ERROR',
        ),
      )
    } else {
      // Something else happened
      handleError(error, 'API')
    }
  }

  return {
    handleError,
    handleApiError,
    AppError,
  }
}
