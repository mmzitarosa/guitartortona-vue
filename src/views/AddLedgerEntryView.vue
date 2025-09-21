<template>
  <LedgerEntryForm editable @submit="onSubmit" @close="onClose"></LedgerEntryForm>
</template>

<script setup lang="ts">
import router from '@/router'
import type { LedgerEntry } from '@/types/ledgerEntry.ts'
import LedgerEntryForm from '@/components/forms/LedgerEntryForm.vue'

const onSubmit = (ledgerEntry: LedgerEntry) => {
  router.push({
    name: 'ledgerEntry',
    params: { id: ledgerEntry.id },
    query: { editable: 'false', from: 'add' },
  })
}

const onClose = () => {
  router.back()
}
</script>
