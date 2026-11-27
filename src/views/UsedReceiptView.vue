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
  />

  <UsedReceiptProduct
    v-model="usedReceipt"
    class="mt-4"
    :editable="editable && receiptPermissions(usedReceipt).edit"
    @rowSelect="onRowSelect"
  />
</template>

<script setup lang="ts">
import UsedReceiptForm from '@/components/forms/usedreceipt/UsedReceiptForm.vue'
import UsedReceiptProduct from '@/components/UsedReceiptProduct.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import router from '@/router'
import { useUsedReceipt } from '@/composables/useUsedReceipt'
import { useRoles } from '@/composables/useRoles'

const route = useRoute()
const id = Number(route.params.id)
const { receiptPermissions } = useRoles()

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

const onSubmit = async () => {
  if (await handleSubmit()) {
    editable.value = false
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
  if (await handleArchive()) router.back()
}

const onRestore = async () => {
  if (await handleRestore()) editable.value = false
}

const onHardDelete = async () => {
  if (await handleHardDelete()) router.back()
}

const onRowSelect = (id?: number, edit?: boolean): void => {
  if (id !== undefined) {
    const editable: string = edit ? 'true' : 'false'
    router.push({ name: 'product', params: { id }, query: { editable } })
  }
}
</script>
