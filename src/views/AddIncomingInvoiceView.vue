<template>
  <IncomingInvoiceForm editable @submit="onSubmit" @close="onClose"></IncomingInvoiceForm>
</template>

<script setup lang="ts">
import router from '@/router'
import IncomingInvoiceForm from '@/components/form/IncomingInvoiceForm.vue'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'


const onSubmit = (incomingInvoice: IncomingInvoice) => {
  router.push({
    name: 'incomingInvoice',
    params: { id: incomingInvoice.id },
    query: { editable: 'true', from: 'add' }
  })
}

const onClose = () => {
  router.back()
}

</script>
