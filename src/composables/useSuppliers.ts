import { type Ref, ref } from 'vue'
import type { Supplier } from '@/types/supplier.ts'
import { getSuppliers } from '@/services/api/supplierService.ts'

export const useSuppliers = () => {
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)

  const loadSuppliers = async () => {
    if (suppliers.value.length > 1) return
    loading.value = true
    try {
      suppliers.value = await getSuppliers()
    } finally {
      loading.value = false
    }
  }

  return { suppliers, loading, loadSuppliers }
}
