<script setup lang="ts">
import { ref, useTemplateRef, type Ref } from 'vue'
import type { GuitarMenu } from '@/model/GuitarMenu'
import GuitarSidebar from '@/components/sidebar/GuitarSidebar.vue'
import { onClickOutside } from '@vueuse/core'

const model = defineModel()
const target = useTemplateRef<HTMLElement>('target')

onClickOutside(target, () => closeMenu())

const closeMenu = (): void => {
  model.value = false
}

const items: Ref<GuitarMenu[]> = ref([
  {
    label: 'Fatture in Entrata',
    items: [
      {
        label: 'Inserisci Fattura',
        icon: 'pi-plus',
        route: '/incomingInvoice',
      },
      {
        label: 'Lista Fatture',
        icon: 'pi-table',
        route: '/incomingInvoices',
      },
    ],
  },
  {
    label: 'Usato',
    items: [
      {
        label: 'Nuova Ricevuta',
        icon: 'pi-plus',
        route: '/usedReceipt',
      },
      {
        label: 'Registro Usato',
        icon: 'pi-list',
        route: '/usedReceipts',
      },
    ],
  },
  {
    label: 'Prodotti',
    items: [
      {
        label: 'Inserisci Prodotto',
        icon: 'pi-plus',
        route: '/product',
      },
      {
        label: 'Ricerca Prodotto',
        icon: 'pi-search',
        route: '/product/search',
      },
      {
        label: 'Inventario',
        icon: 'pi-table',
        route: '/products',
      },
    ],
  },
])
</script>

<template>
  <aside class="w-58 bg-primary text-white hidden lg:flex flex-col">
    <GuitarSidebar :items="items"></GuitarSidebar>
  </aside>

  <aside
    ref="target"
    class="fixed w-58 h-full bg-primary z-50 text-white lg:hidden flex flex-col"
    v-if="model"
  >
    <GuitarSidebar :items="items"></GuitarSidebar>
  </aside>
</template>

<style scoped></style>
