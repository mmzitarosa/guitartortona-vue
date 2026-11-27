<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="constants.title[kind]"
    class="w-full max-w-xl mx-4"
  >
    <p class="mt-2">{{ constants.message[kind] }}</p>

    <!-- Valori della riga a confronto con quelli della ricevuta -->
    <div v-if="alignment" class="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 text-sm mt-4">
      <span class="text-muted-color">{{ constants.columns.field }}</span>
      <span class="text-muted-color">{{ constants.columns.current }}</span>
      <span v-if="alignment.proposed" class="text-muted-color">{{
        constants.columns.proposed
      }}</span>
      <span v-else></span>

      <template v-for="row in rows" :key="row.key">
        <span class="text-muted-color">{{ row.label }}</span>
        <span class="break-words min-w-0">{{ row.current }}</span>
        <span
          v-if="alignment.proposed"
          class="break-words min-w-0"
          :class="{ 'font-semibold': row.changed }"
        >
          {{ row.proposed }}
        </span>
        <span v-else></span>
      </template>

      <p v-if="!alignment.proposed && mode !== 'delete'" class="col-span-full text-muted-color">
        {{ constants.archiveRow }}
      </p>
    </div>

    <template #footer>
      <Button
        type="button"
        severity="secondary"
        text
        :label="mode === 'delete' ? constants.keep : constants.ignore"
        :disabled="loading"
        @click="emit('ignore')"
      />
      <Button type="button" :label="constants.accept[kind]" :loading @click="emit('align')" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button, Dialog } from 'primevue'
import type { LedgerAlignment } from '@/types/usedReceipt'
import { formatCurrency } from '@/utils/currencyUtils'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'

interface LedgerAlignmentDialogProps {
  alignment?: LedgerAlignment
  // update: dopo una modifica o un'archiviazione; delete: prima dell'eliminazione definitiva
  mode?: 'update' | 'delete'
  loading?: boolean
}

const props = withDefaults(defineProps<LedgerAlignmentDialogProps>(), {
  mode: 'update',
  loading: false,
})

const visible = defineModel<boolean>('visible', { required: true })

const emit = defineEmits<{
  align: []
  ignore: []
}>()

const { ledgerAlignment: constants } = useUsedReceiptConstants()

const kind = computed(() =>
  props.mode === 'delete' ? 'DELETE' : (props.alignment?.action ?? 'UPDATE'),
)

const rows = computed(() => {
  const { current, proposed } = props.alignment ?? {}
  const cell = (key: 'date' | 'reason' | 'amount') => ({
    key,
    label: constants.fields[key],
    current: format(key, current?.[key]),
    proposed: format(key, proposed?.[key]),
    changed: current?.[key] !== proposed?.[key],
  })
  return [cell('date'), cell('reason'), cell('amount')]
})

const format = (key: string, value?: string | number) =>
  value === undefined || value === null || value === ''
    ? '-'
    : key === 'amount'
      ? formatCurrency(value as number)
      : String(value)
</script>
