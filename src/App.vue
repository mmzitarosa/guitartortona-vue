<template>
  <!-- SideBar -->
  <Drawer v-model="mobileMenu"></Drawer>

  <!-- Main area -->
  <div class="flex-1 flex flex-col">
    <!-- Topbar -->
    <Header v-model="mobileMenu"></Header>

    <main class="p-6 overflow-auto h-screen">
      <RouterView />
    </main>
    <ConfirmDialog></ConfirmDialog>
    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Drawer from './components/layouts/Drawer.vue'
import Header from './components/layouts/Header.vue'
import { ConfirmDialog, Toast } from 'primevue'
import { useBanks } from '@/composables/useBanks.ts'

const mobileMenu = ref(false)

useBanks()

</script>
