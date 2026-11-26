<template>
  <UsedReceiptsTable
    :filter
    @page="onPage"
    @rowSelect="onRowSelect"
    @productSelect="onProductSelect"
    @filter="onFilter"
  ></UsedReceiptsTable>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'
import UsedReceiptsTable from '@/components/UsedReceiptsTable.vue'

const route = useRoute()

const filter = computed(() => {
  const { page = 0, size = 15, customer, status, archived } = route.query
  const pageN = Number(page)
  const sizeN = Number(size)

  return {
    page: pageN,
    size: sizeN,
    first: pageN * sizeN,
    customer: customer ? (customer as string) : undefined,
    status: status ? (status as string) : undefined,
    archived: archived === 'true',
  }
})

const onPage = (page: number, size: number) => {
  router.replace({
    query: {
      ...route.query,
      page: page.toString(),
      size: size.toString(),
    },
  })
}

const onRowSelect = (id?: number, edit?: boolean): void => {
  if (id !== undefined) {
    const editable: string = edit ? 'true' : 'false'
    router.push({ name: 'usedReceipt', params: { id: id }, query: { editable } })
  }
}

const onProductSelect = (id: number): void => {
  router.push({ name: 'product', params: { id }, query: { editable: 'false' } })
}

const onFilter = (customer?: string, status?: string, archived?: boolean) => {
  router.replace({
    query: {
      customer,
      status,
      archived: archived ? 'true' : undefined,
    },
  })
}
</script>
