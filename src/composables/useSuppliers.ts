import { ref } from 'vue'
import type { Supplier } from '@/types/supplier.ts'
import { getSuppliers } from '@/services/api/supplierService.ts'

export const useSuppliers = () => {
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)

  const addSupplier = (current?: Supplier) => {
    // Inutile se l'input non è valido
    if (!current) return

    // Controllo per evitare l'aggiunta di duplicati
    const exists = suppliers.value.some((supplier) => supplier.id === current.id)
    if (exists) return // Se esiste già, ritorno

    // Aggiungo il nuovo supplier alla lista
    suppliers.value.push(current)
  }

  const loadSuppliers = async () => {
    loading.value = true
    try {
      suppliers.value = await getSuppliers()
    } finally {
      loading.value = false
    }
  }

  return { suppliers, loading, loadSuppliers, addSupplier }
}
