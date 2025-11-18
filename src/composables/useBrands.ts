import { ref } from 'vue'
import type { Brand } from '@/types/brand'
import { getBrands } from '@/services/api/brandService'

export const useBrands = () => {
  const brands = ref<Brand[]>([])
  const loading = ref(false)

  const addBrand = (current?: Brand) => {
    // Inutile se l'input non è valido
    if (!current) return

    // Controllo per evitare l'aggiunta di duplicati
    const exists = brands.value.some((brand) => brand.id === current.id)
    if (exists) return // Se esiste già, ritorno

    // Aggiungo il nuovo brand alla lista
    brands.value.push(current)
  }

  const loadBrands = async () => {
    loading.value = true
    try {
      brands.value = await getBrands()
    } finally {
      loading.value = false
    }
  }

  const formatter = (value: string) => {
    return { id: undefined, name: value } as Brand
  }

  return { brands, loading, loadBrands, formatter, addBrand }
}
