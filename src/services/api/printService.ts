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

// Stampa diretta: la pagina si carica in un iframe nascosto e si apre subito il dialogo di stampa, senza nuove schede
export async function printPageInFrame(
  path: string,
  params: Record<string, string | number>,
): Promise<void> {
  const url = await fetchPrintPageUrl(path, params)
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'

  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    frame.remove()
    URL.revokeObjectURL(url)
  }

  frame.onload = async () => {
    const win = frame.contentWindow
    if (!win) return cleanup()
    try {
      await win.document.fonts?.ready
      win.addEventListener('afterprint', cleanup)
      win.focus()
      win.print()
    } finally {
      // Rete di sicurezza se afterprint non viene emesso
      setTimeout(cleanup, 5 * 60 * 1000)
    }
  }
  frame.src = url
  document.body.appendChild(frame)
}
