<script setup lang="ts">
import { Button, InputGroup, InputText } from 'primevue'

const model = defineModel()

function openMenu(): void {
  model.value = true
}
</script>

<template>
  <header class="flex px-4 py-4 items-center justify-between bg-white shadow-sm">
    <div class="lg:hidden flex items-center w-10">
      <!-- TODO: Da Mobile -->
      <Button icon="pi pi-bars" rounded @click="openMenu" />
    </div>

    <div class="flex-1">
      <div class="max-w-96 mx-auto">
        <InputGroup>
          <InputText placeholder="Cerca..." />
          <Button icon="pi pi-search" />
        </InputGroup>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
