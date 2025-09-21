<template>
  <header class="flex px-4 py-4 items-center justify-between bg-white shadow-sm">
    <!-- Solo da Mobile mostro il menu hamburger -->
    <div class="lg:hidden flex items-center w-10">
      <Button icon="pi pi-bars" rounded @click="openMenu" />
    </div>

    <!-- Contenuto della top bar -->
    <div class="flex-1">
      <div class="max-w-96 mx-auto">
        <InputGroup>
          <InputText :placeholder="LAYOUT.HEADER_SEARCH_LABEL" disabled />
          <Button icon="pi pi-search" disabled />
        </InputGroup>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { LAYOUT } from '@/utils/constants'
import { Button, InputGroup, InputText } from 'primevue'

const model = defineModel<boolean>()

const openMenu = (): void => {
  model.value = true
}
</script>
