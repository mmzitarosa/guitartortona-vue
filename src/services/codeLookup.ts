import { getProductDetailByCode } from '@/services/api/productService'
import { getUsedReceiptDetailByCode } from '@/services/api/usedReceiptService'

export interface CodeTarget {
  name: 'product' | 'usedReceipt'
  id: number
}

// Il codice interno di una ricevuta dell'usato termina con R (es. G000000001R)
const isReceiptCode = (code: string): boolean => /^G\d+R$/i.test(code)

// Cerca un codice a barre: prima prodotto, poi ricevuta usato. Restituisce null se non trovato.
export async function findByCode(code: string): Promise<CodeTarget | null> {
  try {
    const product = await getProductDetailByCode(code)
    if (product.id) return { name: 'product', id: product.id }
  } catch {
    // Nessun prodotto con quel codice
  }
  if (isReceiptCode(code)) {
    try {
      const receipt = await getUsedReceiptDetailByCode(code)
      if (receipt.id) return { name: 'usedReceipt', id: receipt.id }
    } catch {
      // Nessuna ricevuta con quel codice
    }
  }
  return null
}
