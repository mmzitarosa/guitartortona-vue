<template>
  <span class="block border-b border-primary-600 py-2">
    <!-- Capitolo -->
    <p class="px-2 py-1">{{ label }}</p>
    <!-- Bottoni -->
    <ul>
      <li v-for="item in items" :key="item.label">
        <Button
          class="w-full justify-start!"
          :icon="'pi ' + item.icon"
          :label="item.label"
          @click="router.push(item.route!)"
        />
      </li>
    </ul>
  </span>
</template>

<script setup lang="ts">
import type { Menu } from '@/types/menu'
import router from '@/router'
import { Button } from 'primevue'

defineProps<Menu>()
</script>
