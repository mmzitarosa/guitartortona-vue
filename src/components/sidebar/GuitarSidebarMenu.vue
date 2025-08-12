<script setup lang="ts">
import { defineProps } from 'vue'
import type { GuitarMenu } from '@/model/GuitarMenu'
import { Button } from 'primevue'

const props = defineProps<GuitarMenu>()
</script>

<template>
  <span class="block border-b border-primary-600 py-2">
    <p class="px-2 py-1">{{ props.label }}</p>
    <ul>
      <li v-for="item in props.items" :key="item.label">
        <Button class="w-full justify-start!" :icon="'pi ' + item.icon" :label="item.label" />
      </li>
    </ul>
  </span>
</template>
