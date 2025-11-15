<template>
  <IncomingInvoicesTable
    :filter
    @page="onPage"
    @rowSelect="onRowSelect"
    @filter="onFilter"
  ></IncomingInvoicesTable>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'
import IncomingInvoicesTable from '@/components/IncomingInvoicesTable.vue'

const route = useRoute()

const filter = computed(() => {
  const { page = 0, size = 15, supplier, status } = route.query
  const pageN = Number(page)
  const sizeN = Number(size)

  return {
    page: pageN,
    size: sizeN,
    first: pageN * sizeN,
    supplier: supplier ? (supplier as string) : undefined,
    status: status ? (status as string) : undefined,
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

const onRowSelect = (id: number, edit: boolean): void => {
  const editable: string = edit ? 'true' : 'false'
  router.push({ name: 'incomingInvoice', params: { id: id }, query: { editable } })
}

const onFilter = (supplier?: string, status?: string) => {
  router.replace({
    query: {
      supplier,
      status,
    },
  })
}
</script>
