<template>
  <!-- Sidebar Desktop -->
  <aside class="w-58 bg-primary text-white hidden lg:flex flex-col">
    <Sidebar :items="sidebarItems"></Sidebar>
  </aside>

  <!-- TODO: Qui si potrebbe usare il Drawer -->
  <!-- Sidebar Mobile -->
  <aside
    ref="target"
    class="fixed w-58 h-full bg-primary z-50 text-white lg:hidden flex flex-col"
    v-if="model"
    @click="closeMenu"
  >
    <Sidebar :items="sidebarItems"></Sidebar>
  </aside>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useSidebarItems } from '@/utils/i18nConstants'
import Sidebar from '@/components/layout/drawer/Sidebar.vue'

const model = defineModel<boolean>()
const target = useTemplateRef<HTMLElement>('target')
const sidebarItems = useSidebarItems()

// Per chiudere la Sidebar Mobile al click di fuori
onClickOutside(target, () => closeMenu())

const closeMenu = (): void => {
  model.value = false
}
</script>
