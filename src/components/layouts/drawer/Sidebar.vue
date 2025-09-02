<template>
  <!-- Logo Sidebar -->
  <div class="pt-4 px-2">
    <div class="pb-4 px-2 flex w-full justify-center border-b border-primary-600">
      <GuitarLogo
        class="w-48 h-auto object-contain fill-white cursor-pointer"
        @click="router.push({name:'home'})"
      />
    </div>
  </div>

  <!-- Inizio Menu Sidebar -->
  <nav class="px-2 flex-1 overflow-auto">
    <!-- Prima parte -- Fatture in entrata -->
    <SidebarMenu
      v-for="item in items"
      :key="item.label"
      :label="item.label"
      :items="item.items"
    ></SidebarMenu>
  </nav>

  <!-- Footer Sidebar -->
  <div class="pb-2 px-2">
    <div class="pt-2 flex w-full border-t border-primary-600">
      <div class="flex w-full items-center gap-1 text-sm">
        <!-- TODO: Link alle impostazioni -->
        <Button icon="pi pi-cog" rounded @click="router.push({name:'settings'})" />
        <!-- TODO: Impostare nome utente autenticato-->
        <p>{{ LAYOUT.SIDEBAR_USER_PREFIX }}<strong class="text-white">****</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Menu } from '@/types/menu'
import GuitarLogo from '@/components/GuitarLogo.vue'
import { Button } from 'primevue'
import router from '@/router'
import { LAYOUT } from '@/utils/constants'
import SidebarMenu from './SidebarMenu.vue'

defineProps<{ items: Menu[] }>()
</script>
