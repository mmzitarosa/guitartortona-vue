<template>
  <IncomingInvoiceForm
    v-model="incomingInvoice"
    editable
    :loading
    :validation
    :changes
    :dirty
    :pristine
    :existingItem="false"
    @submit="onSubmit"
    @close="onClose"
    @reset="onReset" />
</template>

<script setup lang="ts">
import router from '@/router'
import IncomingInvoiceForm from '@/components/forms/incomininvoice/IncomingInvoiceForm.vue'
import { useIncomingInvoice } from '@/composables/useIncomingInvoice.ts'
import { onMounted } from 'vue'

// Usa il composable centralizzato per gestire l'invoice
const {
  item: incomingInvoice,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  handleSubmit,
  handleReset,
} = useIncomingInvoice()

const onSubmit = async () => {
  const result = await handleSubmit()
  if (result) {
    await router.push({
      name: 'incomingInvoice',
      params: { id: result.id },
      query: { editable: 'true', from: 'add' }
    })
  }
}

const onClose = () => {
  router.back()
}

const onReset = async () => {
  await handleReset()
}

</script>
