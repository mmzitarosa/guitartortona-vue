<template>
  <!-- SideBar -->
  <Drawer v-model="mobileMenu"></Drawer>

  <!-- Main area -->
  <div class="flex-1 flex flex-col">
    <!-- Topbar -->
    <AppHeader v-model="mobileMenu"></AppHeader>

    <main class="p-6 overflow-auto h-screen">
      <RouterView />
    </main>
    <ConfirmDialog></ConfirmDialog>
    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Drawer from './components/layout/Drawer.vue'
import AppHeader from './components/layout/AppHeader.vue'
import { ConfirmDialog, Toast } from 'primevue'

const mobileMenu = ref(false)
</script>
