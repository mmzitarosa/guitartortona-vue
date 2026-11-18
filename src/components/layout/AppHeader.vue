<template>
  <header class="flex px-4 py-4 items-center justify-between bg-white shadow-sm">
    <!-- Solo da Mobile mostro il menu hamburger -->
    <div class="lg:hidden flex items-center w-10">
      <Button icon="pi pi-bars" rounded @click="openMenu" />
    </div>

    <!-- Contenuto della top bar -->
    <div class="flex-1">
      <form class="max-w-96 mx-auto" @submit.prevent="onSearch">
        <InputGroup>
          <InputText v-model="searchText" :placeholder="layoutConstants.search" />
          <Button
            v-if="searchText"
            type="button"
            icon="pi pi-times"
            severity="secondary"
            @click="onClear"
          />
          <Button type="submit" icon="pi pi-search" />
        </InputGroup>
      </form>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutConstants } from '@/utils/i18nConstants'
import { getProductDetailByCode } from '@/services/api/productService'
import { Button, InputGroup, InputText } from 'primevue'

const model = defineModel<boolean>()
const layoutConstants = useLayoutConstants()
const route = useRoute()
const router = useRouter()

const searchText = ref('')

// Il campo riflette la ricerca attiva nell'inventario (anche aprendo un link o tornando indietro)
watch(
  () => [route.name, route.query.search] as const,
  ([name, search]) => {
    searchText.value = name === 'productsList' && typeof search === 'string' ? search : ''
  },
  { immediate: true },
)

const openMenu = (): void => {
  model.value = true
}

const goToProducts = (search?: string): void => {
  router.push({
    name: 'productsList',
    query: search ? { search, available: 'false' } : { available: 'false' },
  })
}

// Un codice a barre non contiene spazi
const isBarcode = (text: string): boolean => !/\s/.test(text)

// Se il testo è un codice prodotto o interno esistente apro direttamente il dettaglio,
// altrimenti (anche in caso di errore) ricerca nell'inventario, comprese le giacenze a zero
const onSearch = async (): Promise<void> => {
  const search = searchText.value.trim()
  if (search && isBarcode(search)) {
    try {
      const product = await getProductDetailByCode(search)
      if (product.id) {
        await router.push({
          name: 'product',
          params: { id: product.id },
          query: { editable: 'false' },
        })
        return
      }
    } catch {
      // Nessun prodotto con quel codice: prosegue con la ricerca
    }
  }
  goToProducts(search || undefined)
}

const onClear = (): void => {
  searchText.value = ''
  if (route.name === 'productsList') goToProducts()
}
</script>
