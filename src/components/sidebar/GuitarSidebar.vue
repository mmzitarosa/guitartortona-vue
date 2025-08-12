<script setup lang="ts">
import type { GuitarMenu } from '@/model/GuitarMenu'
import GuitarLogo from '@/components/GuitarLogo.vue'
import GuitarSidebarMenu from '@/components/sidebar/GuitarSidebarMenu.vue'
import { Button } from 'primevue'

defineProps<{
  items: GuitarMenu[]
}>()
</script>

<template>
  <!-- Logo Sidebar -->
  <div class="pt-4 px-2">
    <div class="pb-4 px-2 flex w-full justify-center border-b border-primary-600">
      <GuitarLogo class="w-48 h-auto object-contain fill-white" />
    </div>
  </div>

  <!-- Inizio Menu Sidebar -->
  <nav class="px-2 flex-1 overflow-auto">
    <!-- Prima parte -- Fatture in entrata -->
    <GuitarSidebarMenu
      v-for="item in items"
      :key="item.label"
      :label="item.label"
      :items="item.items"
    ></GuitarSidebarMenu>
  </nav>

  <!-- Footer -->
  <div class="pb-2 px-2">
    <div class="pt-2 flex w-full border-t border-primary-600">
      <div class="flex w-full items-center gap-1 text-sm">
        <Button icon="pi pi-cog" rounded />
        <p>Utente: <strong class="text-white">****</strong></p>
        <!-- TODO: Impostare nome utente autenticato-->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
