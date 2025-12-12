<template>
  <Card>
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="products"
        :paginator="products.length > filter.size"
        @page="onPage"
        :rows="filter.size"
        :first="filter.first"
        dataKey="id"
        filterDisplay="row"
        :loading
        :globalFilterFields="['categoryId', 'brandId', 'description']"
      >
        <template #empty>Nessuna prodotto trovato.</template>
        <template #loading>Caricando i prodotti...</template>
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
              @valueChange="(categoryId?: number) => onCategory(filterCallback, categoryId)"
              :options="categories"
              optionValue="id"
              optionLabel="name"
              placeholder="Filtro per categoria"
              :showClear="true"
              :loading="categoriesLoading"
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
              @valueChange="(brandId?: number) => onBrand(filterCallback, brandId)"
              :options="brands"
              optionValue="id"
              optionLabel="name"
              placeholder="Filtro per marca"
              :showClear="true"
              :loading="brandsLoading"
            />
          </template>
        </Column>
        <Column filterField="description" header="Descrizione" :showFilterMenu="false">
          <template #body="{ data }">
            <p v-if="data.description">
              {{ data.description }}
            </p>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @valueChange="(description?: string) => onDescription(filterCallback, description)"
              placeholder="Filtro per descrizione"
            />
          </template>

        </Column>
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
  Column,
  DataTable,
  type DataTablePageEvent,
  type DataTableFilterMeta,
  InputText,
  Select, type DataTableFilterMetaData
} from 'primevue'
import { computed, onMounted, type Ref, ref, watch } from 'vue'
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
  loadProducts()
  const { categoryId, brandId, description } = props.filter
  setFilter(categoryId, brandId, description)
})

watch(
  () => props.filter,
  (value) => {
    setFilter(value.categoryId, value.brandId, value.description)
  }
)

const onRowSelect = (data: ProductLight, edit: boolean): void => {
  emit('rowSelect', data.id, edit)
}

const filters: Ref<DataTableFilterMeta> = ref({
  categoryId: { value: undefined, matchMode: FilterMatchMode.EQUALS },
  brandId: { value: undefined, matchMode: FilterMatchMode.EQUALS },
  description: { value: undefined, matchMode: FilterMatchMode.CONTAINS }
})

const _categoryId = computed({
  get: (): number | undefined => getFilterValue<number>('categoryId'),
  set: (value?: number): void => setFilterValue<number>('categoryId', value)
})

const _brandId = computed({
  get: (): number | undefined => getFilterValue<number>('brandId'),
  set: (value?: number): void => setFilterValue<number>('brandId', value)
})

const _description = computed({
  get: (): string | undefined => getFilterValue<string>('description'),
  set: (value?: string): void => setFilterValue<string>('description', value)
})

const getFilterValue = <T>(field: string): T | undefined => {
  return (filters.value[field] as DataTableFilterMetaData).value
}

const setFilterValue = <T>(field: string, value?: T): void => {
  (filters.value[field] as DataTableFilterMetaData).value = value
}

const setFilter = (categoryId?: number, brandId?: number, description?: string): void => {
  _categoryId.value = categoryId
  _brandId.value = brandId
  _description.value = description
}

const onCategory = (filterCallback: () => void, categoryId?: number): void => {
  onFilter(filterCallback, categoryId, _brandId.value, _description.value)
}

const onBrand = (filterCallback: () => void, brandId?: number): void => {
  onFilter(filterCallback, _categoryId.value, brandId, _description.value)
}

const onDescription = (filterCallback: () => void, description?: string): void => {
  onFilter(filterCallback, _categoryId.value, _brandId.value, description)
}

const onPage = (event: DataTablePageEvent): void => {
  const rows = event.rows
  const page = event.first / rows
  emit('page', page, rows)
}

const onFilter = (filterCallback: () => void, categoryId?: number, brandId?: number, description?: string): void => {
  emit('filter', categoryId, brandId, description)
  filterCallback()
}
</script>
