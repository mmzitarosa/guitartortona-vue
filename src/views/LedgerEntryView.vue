<template>
  <LedgerEntryForm :editable :id @submit="onSubmit" @close="onClose" @edit="onEdit" @delete="onDelete">
  </LedgerEntryForm>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import LedgerEntryForm from '@/components/form/LedgerEntryForm.vue'
import router from '@/router'
import { computed, ref } from 'vue'

const route = useRoute()

const id = Number(route.params.id)

const editable = computed({
  get: () => route.query.editable === "true",
  set: (val: boolean) => {
    router.replace({
      query: {
        ...route.query,
        editable: String(val)
      }
    })
  }
})

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
