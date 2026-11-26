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
    @archive="onArchive"
    @restore="onRestore"
    @hardDelete="onHardDelete"
    @reset="onReset"
    @complete="onComplete"
  />

  <IncomingInvoiceProduct v-model="incomingInvoice" class="mt-4" :editable="editable && !incomingInvoice.archived" @rowSelect="onRowSelect"/>
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
  incomingInvoice,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  existingItem,
  loadIncomingInvoice,
  handleSubmit,
  handleComplete,
  handleReset,
  handleClose,
  handleArchive,
  handleRestore,
  handleHardDelete,
} = useIncomingInvoice()

// Carica la fattura
onMounted(async () => {
  await loadIncomingInvoice(id)
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

const onComplete = async () => {
  await handleComplete()
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
  await handleRestore()
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
