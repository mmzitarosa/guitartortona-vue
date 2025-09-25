<template>
  <IncomingInvoiceForm
    :editable
    :id
    :backable
    @submit="onSubmit"
    @close="onClose"
    @edit="onEdit"
    @delete="onDelete"
  ></IncomingInvoiceForm>
</template>

<script setup lang="ts">
import IncomingInvoiceForm from '@/components/forms/incomininvoice/IncomingInvoiceForm.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'
import LedgerEntryForm from '@/components/forms/LedgerEntryForm.vue'

const route = useRoute()

const id = Number(route.params.id)

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

const onSubmit = () => {
  editable.value = false
}

const onClose = () => {
  if (editable.value) editable.value = false
  else router.back()
}

const onEdit = () => {
  editable.value = true
}

const onDelete = () => {
  router.back()
}
</script>
