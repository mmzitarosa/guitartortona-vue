<template>
  <IncomingInvoiceForm
    v-model="incomingInvoice"
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
    @delete="onDelete"
    @reset="onReset"
    @complete="onComplete"
  />

  <IncomingInvoiceProduct
    v-model="incomingInvoice"
    class="mt-4"
    :editable
    :id="incomingInvoice.id!"
  />
</template>

<script setup lang="ts">
import IncomingInvoiceForm from '@/components/forms/incomininvoice/IncomingInvoiceForm.vue'
import IncomingInvoiceProduct from '@/components/IncomingInvoiceProduct.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import router from '@/router'
import { useIncomingInvoice } from '@/composables/useIncomingInvoice'

const route = useRoute()
const id = Number(route.params.id)

// Usa il composable centralizzato per gestire l'invoice
const {
  item: incomingInvoice,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  existingItem,
  loadItem,
  handleSubmit,
  handleComplete,
  handleReset,
  handleClose,
  handleDelete,
} = useIncomingInvoice()

// Carica la fattura
onMounted(async () => {
  await loadItem(id)
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
  const result = await handleSubmit()
  if (result) {
    editable.value = false
  }
}

const onComplete = async () => {
  await handleComplete()
}

const onClose = async () => {
  await handleClose()
  if (editable.value) {
    editable.value = false
  } else {
    router.back()
  }
}

const onReset = async () => {
  await handleReset()
}

const onEdit = () => {
  editable.value = true
}

const onDelete = async () => {
  await handleDelete()
  router.back()
}
</script>
