import apiClient from '@/services/api/apiClient'
import { API_CONFIG } from '@/config/api'

/**
 * Le pagine di stampa (HTML generato dall'API) richiedono il token: non si possono aprire con un semplice link.
 * Si scaricano con apiClient e si mostrano tramite Blob URL; <base> fa risolvere font e immagini sul server API.
 */
export async function fetchPrintPageUrl(
  path: string,
  params: Record<string, string | number>,
): Promise<string> {
  const { data } = await apiClient.get<string>(path, { params, responseType: 'text' })
  const html = data.replace(/<head>/i, `<head><base href="${API_CONFIG.baseURL}/">`)
  return URL.createObjectURL(new Blob([html], { type: 'text/html' }))
}

export async function openPrintPage(
  path: string,
  params: Record<string, string | number>,
): Promise<void> {
  // Aperta subito, nel gestore del click, per non farla bloccare dal browser
  const printWindow = window.open('', '_blank')
  if (!printWindow) throw new Error('Impossibile aprire la finestra di stampa: popup bloccato')

  try {
    printWindow.location.href = await fetchPrintPageUrl(path, params)
  } catch (error) {
    printWindow.close()
    throw error
  }
}
