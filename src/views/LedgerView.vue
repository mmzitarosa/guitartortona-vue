<template>
  <LedgerTable
    :filter
    @page="onPage"
    @rowSelect="onRowSelect"
    @search="onSearch"
    @reset="onReset"
  ></LedgerTable>
</template>

<script setup lang="ts">
import LedgerTable from '@/components/LedgerTable.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'

const route = useRoute()

const filter = computed(() => {
  const { page = 0, size = 15, from, to } = route.query
  const pageN = Number(page)
  const sizeN = Number(size)

  return {
    page: pageN,
    size: sizeN,
    first: pageN * sizeN,
    from: from && (from as string).trim() ? (from as string) : undefined,
    to: to && (to as string).trim() ? (to as string) : undefined,
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

const onRowSelect = (id: number): void => {
  router.push({ name: 'ledgerEntry', params: { id: id } })
}

const onSearch = (from: string, to: string): void => {
  router.replace({
    query: {
      from: from?.replace(/\//g, '-'),
      to: to?.replace(/\//g, '-'),
    },
  })
}

const onReset = () => {
  router.replace({ query: {} })
}
</script>
