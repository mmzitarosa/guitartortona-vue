<template>
  <!-- Sidebar Desktop -->
  <aside class="w-58 bg-primary text-white hidden lg:flex flex-col">
    <Sidebar :items="items"></Sidebar>
  </aside>

  <!-- TODO: Qui si potrebbe usare il Drawer -->
  <!-- Sidebar Mobile -->
  <aside
    ref="target"
    class="fixed w-58 h-full bg-primary z-50 text-white lg:hidden flex flex-col"
    v-if="model"
    @click="closeMenu"
  >
    <Sidebar :items="items"></Sidebar>
  </aside>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { SIDEBAR_ITEMS } from '@/utils/constants'
import Sidebar from '@/components/layout/drawer/Sidebar.vue'

const model = defineModel<boolean>()
const target = useTemplateRef<HTMLElement>('target')

// Per chiudere la Sidebar Mobile al click di fuori
onClickOutside(target, () => closeMenu())

const closeMenu = (): void => {
  model.value = false
}

const items = ref(SIDEBAR_ITEMS)
</script>
