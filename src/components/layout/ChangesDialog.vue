<template>
  <ConfirmDialog :group class="w-full max-w-xl mx-4">
    <template #message="slotProps">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <span :class="slotProps.message.icon" class="p-confirmdialog-icon"></span>
          <span class="p-confirmdialog-message">{{ slotProps.message.message }}</span>
        </div>

        <!-- Valori precedenti e nuovi a confronto -->
        <!-- Primo inserimento: nessun valore precedente, solo la colonna finale -->
        <div
          class="grid gap-x-4 gap-y-2 text-sm"
          :class="creation ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_1fr_1fr]'"
        >
          <span class="text-muted-color">{{ constants.field }}</span>
          <span v-if="!creation" class="text-muted-color">{{ constants.before }}</span>
          <span class="text-muted-color">{{ creation ? constants.value : constants.after }}</span>

          <template v-for="change in changes" :key="change.field">
            <span class="text-muted-color">{{ change.field }}</span>
            <span v-if="!creation" class="break-words min-w-0">{{ before(change) }}</span>
            <span class="break-words min-w-0 font-semibold">{{ change.newValue }}</span>
          </template>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ConfirmDialog } from 'primevue'
import { useI18n } from 'vue-i18n'

interface Change {
  field: string
  oldValue: unknown
  newValue: unknown
  ignore: boolean
  isNew?: boolean
}

const props = withDefaults(defineProps<{ changes: Change[]; group?: string }>(), {
  group: 'differences',
})

const creation = computed(() => props.changes.length > 0 && props.changes.every((c) => c.isNew))

const { t } = useI18n()
const constants = {
  field: t('common.changes.field'),
  before: t('common.changes.before'),
  after: t('common.changes.after'),
  value: t('common.changes.value'),
}

const before = (change: Change) => (change.oldValue && !change.ignore ? change.oldValue : '-')
</script>
