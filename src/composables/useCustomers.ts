import { computed, ref } from 'vue'
import { getAllCustomers } from '@/services/api/customerService'
import { type Customer, withFullName } from '@/types/customer'

export const useCustomers = () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)

  const options = computed(() => customers.value.map(withFullName))

  const loadCustomers = async () => {
    loading.value = true
    try {
      customers.value = await getAllCustomers()
    } finally {
      loading.value = false
    }
  }

  return { customers, options, loading, loadCustomers }
}
