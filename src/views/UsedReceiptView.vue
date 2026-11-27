<template>
  <UsedReceiptForm
    v-model="usedReceipt"
    :editable
    :backable
    :loading
    :validation
    :changes
    :dirty
    :pristine
    :existingItem
    @submit="onSubmit"
    @close="onClose"
    @edit="onEdit"
    @archive="onArchive"
    @restore="onRestore"
    @hardDelete="onHardDelete"
    @reset="onReset"
    @complete="onComplete"
    @register="onRegister"
    @reviewLedger="openAlignment('update')"
    @openLedger="onOpenLedger"
  />

  <UsedReceiptProduct
    v-model="usedReceipt"
    class="mt-4"
    :editable="editable && receiptPermissions(usedReceipt).edit"
    @rowSelect="onRowSelect"
    @changed="onProductsChanged"
  />

  <LedgerAlignmentDialog
    v-model:visible="alignmentVisible"
    :alignment="usedReceipt.ledgerAlignment"
    :mode="alignmentMode"
    :loading
    @align="onLedgerChoice('ALIGN')"
    @ignore="onLedgerChoice('IGNORE')"
  />
</template>

<script setup lang="ts">
import UsedReceiptForm from '@/components/forms/usedreceipt/UsedReceiptForm.vue'
import UsedReceiptProduct from '@/components/UsedReceiptProduct.vue'
import LedgerAlignmentDialog from '@/components/forms/usedreceipt/LedgerAlignmentDialog.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import type { LedgerChoice } from '@/types/usedReceipt'
import router from '@/router'
import { useUsedReceipt } from '@/composables/useUsedReceipt'
import { useRoles } from '@/composables/useRoles'

const route = useRoute()
const id = Number(route.params.id)
const { receiptPermissions, isAdmin } = useRoles()

const {
  usedReceipt,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  existingItem,
  loadUsedReceipt,
  handleSubmit,
  handleComplete,
  handleRegister,
  handleReset,
  handleClose,
  handleArchive,
  handleRestore,
  handleHardDelete,
  alignLedger,
  refreshLedgerAlignment,
} = useUsedReceipt()

onMounted(async () => {
  await loadUsedReceipt(id)
})

const editable = computed({
  get: () => route.query.editable === 'true',
  set: (val: boolean) => {
    router.replace({
      query: {
        ...route.query,
        editable: String(val),
      },
    })
  },
})

const backable = computed(() => route.query.from !== 'add' || editable.value)

// Brogliaccio collegato: dopo una modifica o un'archiviazione l'admin sceglie se allinearlo o ignorare la differenza
const alignmentVisible = ref(false)
const alignmentMode = ref<'update' | 'delete'>('update')
// Dopo l'archiviazione la scelta chiude la pagina
const leaveAfterAlignment = ref(false)

const openAlignment = (mode: 'update' | 'delete') => {
  alignmentMode.value = mode
  alignmentVisible.value = true
}

watch(alignmentVisible, (visible) => {
  if (!visible && leaveAfterAlignment.value) router.back()
})

const onLedgerChoice = async (choice: LedgerChoice) => {
  if (alignmentMode.value === 'delete') {
    leaveAfterAlignment.value = false
    alignmentVisible.value = false
    if (await handleHardDelete(choice)) router.back()
    return
  }
  if (await alignLedger(choice)) alignmentVisible.value = false
}

const onProductsChanged = async () => {
  if (!isAdmin || !usedReceipt.value.ledgerEntryId) return
  if (await refreshLedgerAlignment()) openAlignment('update')
}

const onOpenLedger = () => {
  router.push({
    name: 'ledgerEntry',
    params: { id: usedReceipt.value.ledgerEntryId },
    query: { editable: 'false' },
  })
}

const onSubmit = async () => {
  if (await handleSubmit()) {
    editable.value = false
    if (usedReceipt.value.ledgerAlignment) openAlignment('update')
  }
}

// Confermata o registrata: i dati non si modificano più dalla vista corrente
const onComplete = async () => {
  if (await handleComplete()) editable.value = false
}

const onRegister = async () => {
  if (await handleRegister()) editable.value = false
}

const onClose = async () => {
  if (await handleClose()) {
    if (editable.value) editable.value = false
    else router.back()
  }
}

const onReset = async () => {
  await handleReset()
}

const onEdit = () => {
  editable.value = true
}

const onArchive = async () => {
  const hadLedgerRow = isAdmin && !!usedReceipt.value.ledgerEntryId && !usedReceipt.value.ledgerEntryArchived
  if (!(await handleArchive())) return
  if (hadLedgerRow) {
    // L'archiviazione svuota il form: ricarico la ricevuta per sapere se c'è una scelta da fare sul brogliaccio
    await loadUsedReceipt(id)
    if (usedReceipt.value.ledgerAlignment) {
      leaveAfterAlignment.value = true
      openAlignment('update')
      return
    }
  }
  router.back()
}

const onRestore = async () => {
  if (await handleRestore()) editable.value = false
}

const onHardDelete = async () => {
  // Con la riga di brogliaccio ancora attiva l'admin deve prima scegliere cosa farne
  if (usedReceipt.value.ledgerEntryId && !usedReceipt.value.ledgerEntryArchived) {
    openAlignment('delete')
    return
  }
  if (await handleHardDelete()) router.back()
}

const onRowSelect = (id?: number, edit?: boolean): void => {
  if (id !== undefined) {
    const editable: string = edit ? 'true' : 'false'
    router.push({ name: 'product', params: { id }, query: { editable } })
  }
}
</script>
