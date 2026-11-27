<template>
  <ProductForm
    :editable
    :id
    @submit="onSubmit"
    @close="onClose"
    @edit="onEdit"
  >
  </ProductForm>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useRoles } from '@/composables/useRoles'
import router from '@/router'
import { computed } from 'vue'
import ProductForm from '@/components/forms/ProductForm.vue'

const route = useRoute()

const { canEdit } = useRoles()
const id = Number(route.params.id)

const editable = computed({
  get: () => route.query.editable === 'true' && canEdit,
  set: (val: boolean) => {
    router.replace({
      query: {
        ...route.query,
        editable: String(val),
      },
    })
  },
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
</script>
