<template>
  <Card>
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="products"
        paginator
        @page="onPage"
        :rows="filter.size"
        :first="filter.first"
        :totalRecords
        lazy
        scrollable
        scroll-height="flex"
        :loading
        rowHover
        filterDisplay="menu"
        :globalFilterFields="['category']"
        @update:filters="onFilter"
      >
        <template #empty>Nessuna fattura trovata.</template>
        <template #loading>Caricando le fatture...</template>
        <Column
          field="category"
          header="Categoria"
          :showFilterMatchModes="false"
          :showClearButton="false"
          :showApplyButton="false"
        >
          <template #body="{ data }">
            <p v-if="data.category && data.category.name">{{ data.category.name }}</p>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select
              v-model="filterModel.value"
              @change="filterCallback"
              :options="categories"
              optionValue="id"
              optionLabel="name"
              placeholder="Filtro per categoria"
              :showClear="true"
            />
          </template>
        </Column>
        <Column field="brand.name" header="Marca"></Column>
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
import {
  Button,
  Card,
  Select,
  Column,
  DataTable,
  type DataTableFilterMeta,
  type DataTablePageEvent
} from 'primevue'
import { onMounted, type Ref, ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import type { DataTableFilterMetaData } from 'primevue/datatable'
import type { Product } from '@/types/product.ts'
import { useCategories } from '@/composables/useCategories.ts'
import { useBrands } from '@/composables/useBrands.ts'
import { useProductsTable } from '@/composables/useProductsTable.ts'

//const constants = useProductsTableConstants()

const { products, totalRecords, loadProducts, loading } = useProductsTable()

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

const reload = (page?: number, size?: number, categoryId?: number, brandId?: number, description?: string) => {
  updateFilters(categoryId, brandId, description)
  loadProducts(page, size, undefined, categoryId, brandId, description)
}

const onRowSelect = (data: Product, edit: boolean): void => {
  emit('rowSelect', data.id, edit)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows

  emit('page', page, rows)
}

const onFilter = (any: DataTableFilterMeta) => {
  const category = (any['category'] as DataTableFilterMetaData).value
  const brand = (any['brand'] as DataTableFilterMetaData).value
  const description = (any['description'] as DataTableFilterMetaData).value
  emit('filter', category, brand, description)
}

const filters: Ref<DataTableFilterMeta> = ref({})

const updateFilters = (categoryId?: number, brandId?: number, description?: string) => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    category: { value: categoryId, matchMode: FilterMatchMode.EQUALS },
    brand: { value: brandId, matchMode: FilterMatchMode.EQUALS },
    description: { value: description, matchMode: FilterMatchMode.CONTAINS },
  }
}
</script>
