<template>
  <Card>
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="products"
        paginator
        :rows="filter.size"
        dataKey="id"
        filterDisplay="row"
        :loading
        :globalFilterFields="['categoryId', 'brandId']"
      >
        <template #empty>Nessuna fattura trovata.</template>
        <template #loading>Caricando le fatture...</template>
        <Column
          header="Categoria"
          filterField="categoryId"
          :showFilterMenu="false"
          style="min-width: 14rem"
        >
          <template #body="{ data }">
            <p v-if="categories && data.categoryId">
              {{ categories.find((category) => category.id === data.categoryId)?.name }}
            </p>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="categories"
              optionValue="id"
              optionLabel="name"
              placeholder="Filtro per categoria"
              :showClear="true"
            />
          </template>
        </Column>
        <Column
          header="Marca"
          filterField="brandId"
          :showFilterMenu="false"
          style="min-width: 14rem"
        >
          <template #body="{ data }">
            <p v-if="brands && data.brandId">
              {{ brands.find((brand) => brand.id === data.brandId)?.name }}
            </p>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="brands"
              optionValue="id"
              optionLabel="name"
              placeholder="Filtro per marca"
              :showClear="true"
            />
          </template>
        </Column>
        <Column field="description" header="Descrizione"></Column>
        <Column field="quantity" header="Quantità"></Column>
        <Column header="Prezzo">
          <template #body="{ data }">
            <p v-if="data.price">{{ data.price }}</p>
          </template>
        </Column>

        <Column class="w-0 !text-end">
          <template #body="{ data }">
            <span class="flex flex-row-reverse">
              <Button
                type="button"
                icon="pi pi-eye"
                @click="onRowSelect(data, false)"
                severity="primary"
                text
                rounded
              ></Button>
            </span>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Button, Card, Select, Column, DataTable } from 'primevue'
import { onMounted, ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import type { ProductLight } from '@/types/product.ts'
import { useCategories } from '@/composables/useCategories.ts'
import { useBrands } from '@/composables/useBrands.ts'
import { useProductsTable } from '@/composables/useProductsTable.ts'

//const constants = useProductsTableConstants()

const { products, loadProducts, loading } = useProductsTable()

const { brands, loadBrands, loading: brandsLoading } = useBrands()
const { categories, loadCategories, loading: categoriesLoading } = useCategories()

const props = defineProps<{
  filter: {
    page: number
    size: number
    first: number
    categoryId?: number
    brandId?: number
    description?: string
  }
}>()

const emit = defineEmits<{
  page: [page: number, size: number]
  rowSelect: [id?: number, edit?: boolean]
  filter: [categoryId?: number, brandId?: number, description?: string]
}>()

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  loadBrands()
  loadCategories()
  const { page, size, categoryId, brandId, description } = props.filter
  reload(page, size, categoryId, brandId, description)
})

// La logica di load è stata messa nel watch per effettuare la chiamata anche a seguito del click su
// sidebar. Mettendo il listener sulle proprietà, è stato rimosso il load dall'onPage e onFormSubmit
watch(
  () => props.filter,
  (value) => {
    reload(value.page, value.size, value.categoryId, value.brandId, value.description)
  },
)

const reload = (
  page?: number,
  size?: number,
  categoryId?: number,
  brandId?: number,
  description?: string,
) => {
  loadProducts(categoryId, brandId, description)
}

const onRowSelect = (data: ProductLight, edit: boolean): void => {
  emit('rowSelect', data.id, edit)
}
const filters = ref({
  categoryId: { value: null, matchMode: FilterMatchMode.EQUALS },
  brandId: { value: null, matchMode: FilterMatchMode.EQUALS },
  description: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
</script>
