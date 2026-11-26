<template>
  <UsedReceiptForm
    v-model="usedReceipt"
    editable
    :loading
    :validation
    :changes
    :dirty
    :pristine
    :existingItem="false"
    @submit="onSubmit"
    @close="onClose"
    @reset="onReset"
  />
</template>

<script setup lang="ts">
import router from '@/router'
import UsedReceiptForm from '@/components/forms/usedreceipt/UsedReceiptForm.vue'
import { useUsedReceipt } from '@/composables/useUsedReceipt'

const {
  usedReceipt,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  handleSubmit,
  handleClose,
  handleReset,
} = useUsedReceipt()

const onSubmit = async () => {
  const result = await handleSubmit()
  if (result && result !== true) {
    await router.push({
      name: 'usedReceipt',
      params: { id: result.id },
      query: { editable: 'true', from: 'add' },
    })
  }
}

const onClose = async () => {
  if (await handleClose()) router.back()
}

const onReset = async () => {
  await handleReset()
}
</script>
