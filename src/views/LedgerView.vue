<template>
  <LedgerTable :page :rows :first :dateFilter @page="onPage" @rowSelect="onRowSelect"
               @search="onSearch"></LedgerTable>
</template>

<script setup lang="ts">
import LedgerTable from '@/components/LedgerTable.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'

const route = useRoute()

const page = computed(() => Number(route.query.page ?? 0))
const rows = computed(() => Number(route.query.size ?? 15))
const first = computed(() => page.value * rows.value)

const dateFilter = computed(() => {
  const { from, to } = route.query
  if (from && to) return { from: from as string, to: to as string }
  return undefined
})

const onPage = (page: number, size: number) => {
  router.replace({
      query: {
        ...route.query,
        page: page.toString(),
        size: size.toString()
      }
    }
  )
}

const onRowSelect = (id: number): void => {
  router.push({ name: 'ledgerEntry', params: { id: id } })
}

const onSearch = (from: string, to: string): void => {
  router.replace({
    query: {
      from: from?.replace(/\//g, '-'),
      to: to?.replace(/\//g, '-')
    }
  })
}

</script>
