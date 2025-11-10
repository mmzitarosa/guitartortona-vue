import { onMounted, type Ref, ref } from 'vue'
import type { Supplier } from '@/types/supplier.ts'
import { getSuppliers } from '@/services/api/supplierService.ts'
import type { Bank } from '@/types/bank.ts'
import { getBanks } from '@/services/api/bankService.ts'

export const useBanks = () => {
  const banks = ref<Bank[]>([])

  const loadBanks = async () => {
    console.log("loadBanks")
    banks.value = await getBanks()
  }

  onMounted(() => {
    loadBanks()
  })

  return { banks }
}
