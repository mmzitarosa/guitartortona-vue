<template>
  <ConfirmDialog :group>
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
          <span class="text-primary-700 ml-1" v-if="change.oldValue && !change.ignore">{{ change.oldValue }}</span>
          <span class="ml-1" v-if="change.oldValue && !change.ignore">-></span>
          <span class="text-primary-500 ml-1">{{ change.newValue }}</span>
          </div>
        </div>
      </div>

    </template>
  </ConfirmDialog>

</template>
<script setup lang="ts">
import { ConfirmDialog } from 'primevue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ changes: { field: string, oldValue: any, newValue: any, ignore: boolean }[], group?: string }>(), {
  group: "differences"
})

const reset = computed(() => {})

</script>
