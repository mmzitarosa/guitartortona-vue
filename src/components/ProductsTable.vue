<template>
  <Card>
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="products"
        lazy
        paginator
        :totalRecords
        @page="onPage"
        :rows="props.filter.size"
        :first="props.filter.first"
        dataKey="id"
        :loading
        rowHover
        filterDisplay="row"
        selectionMode="single"
        @rowSelect="onRowSelect"
      >
        <template #empty>Nessun prodotto trovato.</template>
        <template #loading>Caricando i prodotti...</template>
        <Column header="Categoria" filterField="categoryId" :showFilterMenu="false">
          <template #filter>
            <Select
              v-model="_categoryId"
              :options="categories"
              optionValue="id"
              optionLabel="name"
              showClear
              :loading="categoriesLoading"
              placeholder="Filtro categoria"
              class="w-48"
              :class="_categoryId ? 'border-black! text-black!' : ''"
            />
          </template>

          <template #body="{ data }">
            <p v-if="data.categoryId">{{ getCategory(data.categoryId)?.name }}</p>
          </template>
        </Column>
        <Column header="Marca" filterField="brandId" :showFilterMenu="false">
          <template #filter>
            <Select
              v-model="_brandId"
              :options="brands"
              optionValue="id"
              optionLabel="name"
              showClear
              :loading="brandsLoading"
              placeholder="Filtro marca"
              class="w-48"
              :class="_brandId ? 'border-black! text-black!' : ''"
            />
          </template>
          <template #body="{ data }">
            <p v-if="data.brandId">{{ getBrand(data.brandId)?.name }}</p>
          </template>
        </Column>
        <Column filterField="description" header="Descrizione" :showFilterMenu="false">
          <template #filter>
            <InputText
              v-model="descriptionText"
              placeholder="Filtro per descrizione"
              class="w-64"
              :class="descriptionText ? 'border-black! text-black!' : ''"
            />
          </template>
          <template #body="{ data }">
            <p v-if="data.description">{{ data.description }}</p>
          </template>
        </Column>
        <Column filterField="condition" :showFilterMenu="false">
          <template #header>
            <span class="p-datatable-column-title">{{ conditionConstants.column }}</span>
          </template>
          <template #filter>
            <Select
              v-model="_condition"
              :options="conditionConstants.options"
              optionValue="value"
              optionLabel="label"
              showClear
              :placeholder="conditionConstants.filter"
              class="w-40"
              :class="_condition ? 'border-black! text-black!' : ''"
            >
              <template #option="{ option }">
                <Tag :value="option.label" :severity="option.severity" />
              </template>
              <template #value="{ value, placeholder }">
                <Tag
                  v-if="value"
                  :value="conditionOf(value)?.label"
                  :severity="conditionOf(value)?.severity"
                />
                <span v-else>{{ placeholder }}</span>
              </template>
            </Select>
          </template>
          <template #body="{ data }">
            <Tag
              v-if="data.condition && conditionOf(data.condition)"
              :value="conditionOf(data.condition)?.label"
              :severity="conditionOf(data.condition)?.severity"
            />
          </template>
        </Column>
        <Column filterField="available" :showFilterMenu="false" style="text-align: center">
          <template #header>
            <span class="p-datatable-column-title w-full"> Quantità </span>
          </template>
          <template #filter>
            <Button
              @click="_available = !_available"
              :severity="_available ? 'contrast' : 'secondary'"
              class="w-18"
              >Stock</Button
            >
          </template>
          <template #body="{ data }">
            <p v-if="data">
              {{ data.stock ?? 0
              }}<span class="text-orange-500" v-if="data.stockPending">{{
                ' (+' + data.stockPending + ')'
              }}</span>
            </p>
          </template>
        </Column>
        <Column style="text-align: right">
          <template #header>
            <span class="p-datatable-column-title w-full"> Prezzo (€) </span>
          </template>

          <template #body="{ data }">
            <p v-if="data.price">{{ formatCurrency(data.price) }}</p>
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
  type DataTableFilterMeta,
  type DataTablePageEvent,
  type DataTableRowSelectEvent,
  InputText,
  Select,
  Tag,
} from 'primevue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useCategories } from '@/composables/useCategories'
import { useBrands } from '@/composables/useBrands'
import { useProductsTable } from '@/composables/useProductsTable'
import { formatCurrency } from '@/utils/currencyUtils'
import { useConditionConstants } from '@/utils/i18nConstants'

const conditionConstants = useConditionConstants()
const conditionOf = (value: 'NEW' | 'USED') =>
  conditionConstants.options.find((option) => option.value === value)

const { products, totalRecords, loadProducts, loading } = useProductsTable()

const { brands, loading: brandsLoading, getBrand } = useBrands()
const { categories, loading: categoriesLoading, getCategory } = useCategories()

const props = defineProps<{
  filter: {
    page: number
    size: number
    first: number
    available: boolean
    categoryId?: number
    brandId?: number
    description?: string
    search?: string
    condition?: 'NEW' | 'USED'
  }
}>()

const emit = defineEmits<{
  page: [page: number, size: number]
  rowSelect: [id?: number, edit?: boolean]
  filter: [
    categoryId?: number,
    brandId?: number,
    description?: string,
    available?: boolean,
    condition?: 'NEW' | 'USED',
  ]
}>()

// Ricarica la tabella quando cambiano pagina o filtri (query della route)
watch(
  () => props.filter,
  (filter) =>
    loadProducts({
      search: filter.search,
      description: filter.description,
      categoryId: filter.categoryId,
      brandId: filter.brandId,
      condition: filter.condition,
      available: filter.available,
      page: filter.page,
      size: filter.size,
    }),
  { immediate: true },
)

const onRowSelect = (data: DataTableRowSelectEvent): void => {
  emit('rowSelect', data.data.id, false)
}

const filters = computed((): DataTableFilterMeta => {
  return {
    categoryId: { value: props.filter.categoryId, matchMode: FilterMatchMode.EQUALS },
    brandId: { value: props.filter.brandId, matchMode: FilterMatchMode.EQUALS },
    condition: { value: props.filter.condition, matchMode: FilterMatchMode.EQUALS },
    available: {
      value: props.filter.available ? true : undefined,
      matchMode: FilterMatchMode.EQUALS,
    },
  }
})

const currentDescription = () => descriptionText.value.trim() || undefined

const _categoryId = computed({
  get: (): number | undefined => props.filter.categoryId,
  set: (value?: number): void =>
    onFilter(value, _brandId.value, currentDescription(), _available.value, _condition.value),
})

const _brandId = computed({
  get: (): number | undefined => props.filter.brandId,
  set: (value?: number): void =>
    onFilter(_categoryId.value, value, currentDescription(), _available.value, _condition.value),
})

const _condition = computed({
  get: (): 'NEW' | 'USED' | undefined => props.filter.condition,
  set: (value?: 'NEW' | 'USED'): void =>
    onFilter(_categoryId.value, _brandId.value, currentDescription(), _available.value, value),
})

// Il testo digitato è locale; il filtro parte 300 ms dopo l'ultimo carattere
const FILTER_DELAY_MS = 300
const descriptionText = ref(props.filter.description ?? '')
let descriptionTimer: ReturnType<typeof setTimeout> | undefined

watch(descriptionText, (value) => {
  clearTimeout(descriptionTimer)
  descriptionTimer = setTimeout(() => {
    const description = value.trim() || undefined
    if (description !== props.filter.description)
      onFilter(_categoryId.value, _brandId.value, description, _available.value, _condition.value)
  }, FILTER_DELAY_MS)
})

// Il filtro può cambiare dall'esterno (es. link o navigazione): riallineo il campo
watch(
  () => props.filter.description,
  (value) => {
    if ((value ?? '') !== descriptionText.value.trim()) descriptionText.value = value ?? ''
  },
)

onBeforeUnmount(() => clearTimeout(descriptionTimer))

const _available = computed({
  get: (): boolean => props.filter.available,
  set: (value?: boolean): void =>
    onFilter(_categoryId.value, _brandId.value, currentDescription(), value, _condition.value),
})

const onPage = (event: DataTablePageEvent): void => {
  const rows = event.rows
  const page = event.first / rows
  emit('page', page, rows)
}

const onFilter = (
  categoryId?: number,
  brandId?: number,
  description?: string,
  available?: boolean,
  condition?: 'NEW' | 'USED',
): void => {
  emit('filter', categoryId, brandId, description, available, condition)
}
</script>
