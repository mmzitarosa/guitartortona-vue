<template>
  <IncomingInvoiceForm editable @submit="onFormSubmit" @close="onFormClose"></IncomingInvoiceForm>
</template>

<script setup lang="ts">
import router from '@/router'
import IncomingInvoiceForm from '@/components/form/IncomingInvoiceForm.vue'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'


const onFormSubmit = (incomingInvoice: IncomingInvoice) => {
  router.push({
    name: 'incomingInvoice',
    params: { id: incomingInvoice.id },
    query: { editable: 'true' }
  })
}

const onFormClose = () => {
  router.back()
}

</script>
