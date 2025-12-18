<template>
  <LedgerTable
    :filter
    @page="onPage"
    @year="onYear"
    @rowSelect="onRowSelect"
    @filter="onFilter"
    @print="onPrint"
  ></LedgerTable>
</template>

<script setup lang="ts">
import LedgerTable from '@/components/LedgerTable.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'
import { formatDate } from '@/utils/dateUtils.ts'
import { print } from '@/services/api/ledgerService.ts'

const route = useRoute()

const filter = computed(() => {
  const { page = 0, size = 15, from, to, year = new Date().getFullYear() - 1 } = route.query
  const pageN = Number(page)
  const sizeN = Number(size)

  return {
    page: pageN,
    size: sizeN,
    first: pageN * sizeN,
    year: Number(year),
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

const onRowSelect = (id?: number): void => {
  if (id) {
    router.push({ name: 'ledgerEntry', params: { id: id } })
  }
}

const onYear = (year: number) => {
  router.replace({
    query: {
      ...route.query,
      year: year.toString(),
    },
  })
}

const onFilter = (from?: Date, to?: Date) => {
  router.replace({
    query: {
      from: formatDate(from, '-'),
      to: formatDate(to, '-'),
    },
  })
}

const onPrint = (from: Date, to: Date) => {
  print(formatDate(from, '-')!, formatDate(to, '-')!)
}
</script>
