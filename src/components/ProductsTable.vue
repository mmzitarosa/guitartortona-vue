<template>
  <Card>
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="products"
        :paginator="products.length > props.filter.size"
        @page="onPage"
        :rows="props.filter.size"
        :first="props.filter.first"
        dataKey="id"
        :loading
        rowHover
        filterDisplay="row"
        :globalFilterFields="['categoryId', 'brandId', 'description']"
        selectionMode="single"
        @rowSelect="onRowSelect"
      >
        <template #empty>Nessun prodotto trovato.</template>
        <template #loading>Caricando i prodotti...</template>
        <Column
          header="Categoria"
          filterField="categoryId"
          :showFilterMenu="false"
          style="min-width: 14rem"
        >
          <template #filter>
            <Select
              v-model="_categoryId"
              :options="categories"
              optionValue="id"
              optionLabel="name"
              showClear
              :loading="categoriesLoading"
              placeholder="Filtro per categoria"
            />
          </template>

          <template #body="{ data }">
            <p v-if="data.categoryId">{{ getCategory(data.categoryId)?.name }}</p>
          </template>
        </Column>
        <Column
          header="Marca"
          filterField="brandId"
          :showFilterMenu="false"
          style="min-width: 14rem"
        >
          <template #filter>
            <Select
              v-model="_brandId"
              :options="brands"
              optionValue="id"
              optionLabel="name"
              showClear
              :loading="brandsLoading"
              placeholder="Filtro per marca"
            />
          </template>
          <template #body="{ data }">
            <p v-if="data.brandId">{{ getBrand(data.brandId)?.name }}</p>
          </template>
        </Column>
        <Column filterField="description" header="Descrizione" :showFilterMenu="false">
          <template #filter>
            <InputText v-model="_description" placeholder="Filtro per descrizione" />
          </template>
          <template #body="{ data }">
            <p v-if="data.description">{{ data.description }}</p>
          </template>
        </Column>
        <Column header="Quantità">
          <template #body="{ data }">
            <p v-if="data">
              {{ data.stock ?? 0
              }}<span class="text-orange-500" v-if="data.stockPending">{{
                ' (+' + data.stockPending + ')'
              }}</span>
            </p>
          </template>
        </Column>
        <Column header="Prezzo">
          <template #body="{ data }">
            <p v-if="data.price">{{ data.price }}</p>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
import {
  Card,
  Column,
  DataTable,
  type DataTablePageEvent,
  type DataTableFilterMeta,
  InputText,
  Select,
  type DataTableRowSelectEvent,
} from 'primevue'
import { computed, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useCategories } from '@/composables/useCategories'
import { useBrands } from '@/composables/useBrands'
import { useProductsTable } from '@/composables/useProductsTable'

const { products, loadProducts, loading } = useProductsTable()

const { brands, loading: brandsLoading, getBrand } = useBrands()
const { categories, loading: categoriesLoading, getCategory } = useCategories()

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
  loadProducts()
})

const onRowSelect = (data: DataTableRowSelectEvent): void => {
  emit('rowSelect', data.data.id, false)
}

const filters = computed((): DataTableFilterMeta => {
  return {
    categoryId: { value: props.filter.categoryId, matchMode: FilterMatchMode.EQUALS },
    brandId: { value: props.filter.brandId, matchMode: FilterMatchMode.EQUALS },
    description: { value: props.filter.description, matchMode: FilterMatchMode.CONTAINS },
  }
})

const _categoryId = computed({
  get: (): number | undefined => props.filter.categoryId,
  set: (value?: number): void => onFilter(value, _brandId.value, _description.value),
})

const _brandId = computed({
  get: (): number | undefined => props.filter.brandId,
  set: (value?: number): void => onFilter(_categoryId.value, value, _description.value),
})

const _description = computed({
  get: (): string | undefined => props.filter.description,
  set: (value?: string): void => onFilter(_categoryId.value, _brandId.value, value),
})

const onPage = (event: DataTablePageEvent): void => {
  const rows = event.rows
  const page = event.first / rows
  emit('page', page, rows)
}

const onFilter = (categoryId?: number, brandId?: number, description?: string): void => {
  emit('filter', categoryId, brandId, description)
}
</script>
