<template>
  <ConfirmDialog group="differences">
    <template #message="slotProps">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <span :class="slotProps.message.icon" class="p-confirmdialog-icon"
                data-pc-section="icon"></span>
          <span class="p-confirmdialog-message"
                data-pc-section="message">{{ slotProps.message.message
            }}</span>
        </div>
        <div class="flex flex-col gap-2" >
          <div v-for="change in changes" :key="change.field">
          <span>{{ change.field }}:</span>
          <span class="ml-1" v-if="change.oldValue">{{ change.oldValue }}</span>
          <span class="ml-1" v-if="change.oldValue">-></span>
          <span :class="'text-primary-500'" class="ml-1">{{ change.newValue }}</span>
          </div>
        </div>
      </div>

    </template>
  </ConfirmDialog>

</template>
<script setup lang="ts">
import { ConfirmDialog } from 'primevue'
import { computed } from 'vue'

defineProps<{ changes: { field: string, oldValue: any, newValue: any }[] }>()

const reset = computed(() => {})

</script>
