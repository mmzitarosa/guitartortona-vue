<template>
  <Card>
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="rows"
        :paginator="rows.length > props.filter.size"
        @page="onPage"
        :rows="props.filter.size"
        :first="props.filter.first"
        dataKey="id"
        :pt="{ rowExpansion: { class: 'hover:!bg-transparent' } }"
        :expandedRows
        :loading
        rowHover
        :globalFilterFields="['customer', 'status']"
        selectionMode="single"
        @rowSelect="onRowSelect"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              label="Rimuovi filtri"
              icon="pi pi-filter-slash"
              :disabled="!_status && !_customer && !_archived"
              severity="secondary"
              variant="text"
              @click="onFilter(undefined, undefined, false)"
            />

            <div class="flex flex-wrap gap-4">
              <SelectField
                v-if="viewOptions.length"
                v-model="_view"
                inputId="view"
                :options="viewOptions"
                optionValue="value"
                optionLabel="label"
                showClear
                label="Stato"
                class="w-56"
              />

              <SelectField
                v-model="_customer"
                inputId="customer"
                :options="customerNames"
                optionValue="name"
                optionLabel="name"
                showClear
                :label="constants.customerFilter"
                class="w-64"
              />
            </div>
          </div>
        </template>
        <template #empty>{{ constants.empty }}</template>
        <template #loading>{{ constants.loading }}</template>
        <Column :header="constants.columns.date"
          ><template #body="{ data }">{{ formatDate(data.date) }}</template></Column
        >
        <Column>
          <template #header>
            <span class="p-datatable-column-title flex items-center group">
              {{ constants.columns.customer }}
              <span class="ml-4">
                <span :class="_customer ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (_customer ? 'pi-filter-fill' : 'pi-filter')"></i>
                </span>
                <span
                  :class="'hidden ' + (_customer ? 'group-hover:inline-block cursor-pointer' : '')"
                >
                  <i class="pi pi-filter-slash" @click="_customer = undefined"></i>
                </span>
              </span>
            </span>
          </template>

          <template #body="{ data }">
            <p v-if="data.customer">{{ data.customer }}</p>
          </template>
        </Column>
        <Column field="number" :header="constants.columns.number"></Column>
        <Column :header="constants.columns.amount">
          <template #body="{ data }">
            <p v-if="data.amount">{{ formatCurrency(data.amount) }}</p>
          </template>
        </Column>
        <Column
          field="status"
          class="w-24"
          :showFilterMatchModes="false"
          :showClearButton="false"
          :showApplyButton="false"
        >
          <template #header>
            <span class="p-datatable-column-title flex items-center group">
              {{ constants.columns.status }}
              <span class="ml-4">
                <span :class="_status ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (_status ? 'pi-filter-fill' : 'pi-filter')"></i>
                </span>
                <span
                  :class="'hidden ' + (_status ? 'group-hover:inline-block cursor-pointer' : '')"
                >
                  <i class="pi pi-filter-slash" @click="_status = undefined"></i>
                </span>
              </span>
            </span>
          </template>
          <template #body="{ data }">
            <Tag
              v-if="data && constants.status[statusOf(data)]"
              :value="constants.status[statusOf(data)].label"
              :severity="constants.status[statusOf(data)].severity"
            />
          </template>
        </Column>
        <!-- I prodotti della ricevuta sono sempre visibili: nessun comando per comprimere -->
        <template #expansion="{ data }">
          <div class="ps-12 pe-4 pb-2 text-sm">
            <div :class="[itemGrid, 'text-xs text-muted-color pb-1']">
              <span>{{ constants.item.number }}</span>
              <span>{{ constants.item.description }}</span>
              <span class="text-right">{{ constants.item.cost }}</span>
              <span>{{ constants.item.saleDate }}</span>
              <span class="text-right">{{ constants.item.price }}</span>
              <span class="text-right">{{ constants.item.margin }}</span>
              <span class="text-right">{{ constants.item.vat }}</span>
              <span>{{ constants.item.receipt }}</span>
            </div>
            <div
              v-for="item in data.items"
              :key="item.id"
              :class="[
                itemGrid,
                'cursor-pointer rounded hover:bg-surface-100 dark:hover:bg-surface-800',
              ]"
              @click.stop="emit('productSelect', item.productId)"
            >
              <span class="font-medium">{{ item.reference }}</span>
              <span class="truncate" v-tooltip.bottom="itemDescription(item)">{{
                itemDescription(item)
              }}</span>
              <span class="text-right tabular-nums">{{ formatCurrency(item.cost) }}</span>
              <span>{{ item.saleDate }}</span>
              <span class="text-right tabular-nums">{{ formatCurrency(item.salePrice) }}</span>
              <span
                class="text-right tabular-nums"
                :class="(item.margin ?? 0) < 0 ? 'text-red-500' : 'text-green-600'"
              >
                {{ formatCurrency(item.margin) }}
              </span>
              <span class="text-right">{{ item.saleVat != null ? item.saleVat + '%' : '' }}</span>
              <span>{{ item.saleReceipt }}</span>
            </div>
          </div>
        </template>
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
  Tag,
} from 'primevue'
import { computed, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useUsedReceiptsTable } from '@/composables/useUsedReceiptsTable'
import { useUsedReceiptsTableConstants } from '@/utils/i18nConstants'
import { useRoles } from '@/composables/useRoles'
import { formatDate } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/currencyUtils'
import type { UsedReceiptLightItem } from '@/types/usedReceipt'
import SelectField from '@/components/layout/fields/SelectField.vue'

const constants = useUsedReceiptsTableConstants()

const { usedReceipts, archivedReceipts, totalArchived, totalDrafts, loadUsedReceipts, loading } =
  useUsedReceiptsTable()
const { isAdmin } = useRoles()

const props = defineProps<{
  filter: {
    page: number
    size: number
    first: number
    customer?: string
    status?: string
    archived?: boolean
  }
}>()

const emit = defineEmits<{
  page: [page: number, size: number]
  rowSelect: [id?: number, edit?: boolean]
  productSelect: [id: number]
  filter: [customer?: string, status?: string, archived?: boolean]
}>()

onMounted(loadUsedReceipts)

const onRowSelect = (data: DataTableRowSelectEvent): void => {
  emit('rowSelect', data.data.id, false)
}

const filters = computed(
  (): DataTableFilterMeta => ({
    customer: { value: props.filter.customer, matchMode: FilterMatchMode.EQUALS },
    status: { value: props.filter.status, matchMode: FilterMatchMode.EQUALS },
  }),
)

const _archived = computed({
  get: (): boolean => !!props.filter.archived && isAdmin,
  set: (value: boolean): void => onFilter(_customer.value, _status.value, value),
})

const rows = computed(() => (_archived.value ? archivedReceipts.value : usedReceipts.value))

// Nell'elenco delle eliminate lo stato mostrato è sempre "eliminata"
const statusOf = (data: { status: string }) =>
  (_archived.value ? 'ARCHIVED' : data.status) as keyof typeof constants.status

const expandedRows = computed(() =>
  Object.fromEntries(rows.value.map((receipt) => [receipt.id, true])),
)

const itemGrid =
  'grid grid-cols-[5rem_minmax(10rem,1fr)_6rem_7rem_6rem_6rem_4rem_5rem] gap-x-4 items-baseline px-2 py-1'

const itemDescription = (item: UsedReceiptLightItem) =>
  [item.category, item.brand, item.description].filter(Boolean).join(' · ')

// Il filtro cliente offre i nomi presenti nell'elenco visualizzato
const customerNames = computed(() =>
  [
    ...new Set(
      rows.value.map((receipt) => receipt.customer).filter((name): name is string => !!name),
    ),
  ]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name })),
)

const _customer = computed({
  get: (): string | undefined => props.filter.customer,
  set: (value?: string): void => onFilter(value, _status.value, _archived.value),
})

const _status = computed({
  get: (): string | undefined => props.filter.status,
  set: (value?: string): void => onFilter(_customer.value, value, _archived.value),
})

// Un solo filtro per la vista: bozze/da confermare ed eliminate si escludono a vicenda
const _view = computed({
  get: (): string | undefined => (_archived.value ? 'ARCHIVED' : _status.value || undefined),
  set: (v?: string): void =>
    onFilter(_customer.value, v && v !== 'ARCHIVED' ? v : undefined, v === 'ARCHIVED'),
})

const viewOptions = computed(() =>
  [
    { value: 'DRAFT', label: 'Bozze (' + totalDrafts + ')', show: totalDrafts.value > 0 },
    {
      value: 'ARCHIVED',
      label: 'Eliminate (' + totalArchived.value + ')',
      show: isAdmin && totalArchived.value > 0,
    },
  ].filter((option) => option.show || option.value === _view.value),
)

const onPage = (event: DataTablePageEvent): void => {
  const size = event.rows
  emit('page', event.first / size, size)
}

const onFilter = (customer?: string, status?: string, archived?: boolean): void => {
  emit('filter', customer, status, archived)
}
</script>
