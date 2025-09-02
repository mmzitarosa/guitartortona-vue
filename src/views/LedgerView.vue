<template>
  <LedgerTable :page :size @page="onPage" @rowSelect="onRowSelect"></LedgerTable>
</template>

<script setup lang="ts">
import LedgerTable from '@/components/LedgerTable.vue'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import router from '@/router'

const route = useRoute()
const page = ref(Number(route.query.page ?? 0))
const rows = ref(Number(route.query.size ?? 15))

const onPage = (page: number, size: number) => {
  router.replace({
      query: {
        ...route.query,
        page: page.toString(),
        size: size.toString(),
      }
    }
  )
}

const onRowSelect = (id: number): void => {
  router.push({ name: 'ledgerEntry', params: { id: id } })
}

</script>
