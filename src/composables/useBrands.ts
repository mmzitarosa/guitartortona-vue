import { computed, onMounted, ref } from 'vue'
import type { Brand } from '@/types/brand'
import { getAllBrands } from '@/services/api/brandService'

// Stato condiviso: una marca creata in un form deve essere visibile anche nelle tabelle
const brands = ref<Brand[]>([])
const loading = ref(false)

export const useBrands = () => {
  onMounted(() => loadBrands())

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
      brands.value = await getAllBrands()
    } finally {
      loading.value = false
    }
  }

  const ensureBrand = async (brandId?: number) => {
    if (brandId && !brands.value.some((brand) => brand.id === brandId)) await loadBrands()
  }

  const formatter = (value: string) => {
    return { id: undefined, name: value } as Brand
  }

  const map = computed(() => {
    const map = new Map<number, Brand>()
    brands.value.forEach((brand) => {
      if (brand.id) {
        map.set(brand.id, brand)
      }
    })
    return map
  })

  const getBrand = (brandId?: number): Brand | undefined => {
    return brandId ? map.value.get(brandId) : undefined
  }

  return { brands, loading, formatter, getBrand, addBrand, ensureBrand }
}
