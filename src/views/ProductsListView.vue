<template>
  <ProductsTable :filter @page="onPage" @rowSelect="onRowSelect" @filter="onFilter"></ProductsTable>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from '@/router'
import ProductsTable from '@/components/ProductsTable.vue'

const route = useRoute()

const filter = computed(() => {
  const { page = 0, size = 15, category, brand, description, search, available = 'true' } = route.query
  const pageN = Number(page)
  const sizeN = Number(size)

  return {
    page: pageN,
    size: sizeN,
    first: pageN * sizeN,
    categoryId: category ? Number(category) : undefined,
    brandId: brand ? Number(brand) : undefined,
    description: description ? (description as string) : undefined,
    search: search ? (search as string) : undefined,
    available: available === 'true' ? true : false,
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
    router.push({ name: 'product', params: { id }, query: { editable } })
  }
}

const onFilter = (
  categoryId?: number,
  brandId?: number,
  description?: string,
  available?: boolean,
) => {
  router.replace({
    query: {
      category: categoryId,
      brand: brandId,
      description,
      // La ricerca della barra in alto resta attiva mentre si cambiano i filtri
      search: route.query.search,
      available: String(available),
    },
  })
}
</script>
