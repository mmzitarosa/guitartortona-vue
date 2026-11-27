<template>
  <ConfirmDialog :group>
    <template #message="slotProps">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <span :class="slotProps.message.icon" class="p-confirmdialog-icon"></span>
          <span class="p-confirmdialog-message">{{ slotProps.message.message }}</span>
        </div>

        <!-- Valori precedenti e nuovi a confronto -->
        <div class="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 text-sm">
          <span class="text-muted-color">{{ constants.field }}</span>
          <span class="text-muted-color">{{ constants.before }}</span>
          <span class="text-muted-color">{{ constants.after }}</span>

          <template v-for="change in changes" :key="change.field">
            <span class="text-muted-color">{{ change.field }}</span>
            <span class="break-words min-w-0">{{ before(change) }}</span>
            <span class="break-words min-w-0 font-semibold">{{ change.newValue }}</span>
          </template>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { ConfirmDialog } from 'primevue'
import { useI18n } from 'vue-i18n'

interface Change {
  field: string
  oldValue: unknown
  newValue: unknown
  ignore: boolean
}

withDefaults(defineProps<{ changes: Change[]; group?: string }>(), {
  group: 'differences',
})

const { t } = useI18n()
const constants = {
  field: t('common.changes.field'),
  before: t('common.changes.before'),
  after: t('common.changes.after'),
}

const before = (change: Change) => (change.oldValue && !change.ignore ? change.oldValue : '-')
</script>
