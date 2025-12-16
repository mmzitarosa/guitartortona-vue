<template>
  <Card>
    <template #content>
      <!-- TODO Da telefono fa un po' cagare -->
      <DataTable
        v-model:filters="filters"
        :value="incomingInvoices"
        :paginator="incomingInvoices.length > filter.size"
        @page="onPage"
        :rows="filter.size"
        :first="filter.first"
        dataKey="id"
        :loading
        rowHover
        :globalFilterFields="['supplierId', 'status']"
        selectionMode="single"
        @rowSelect="onRowSelect"
      >
        <template #header>
          <div class="flex justify-between">
            <div class="flex gap-4">
              <Select
                v-model="_supplierId"
                @valueChange="onSupplier"
                :options="suppliers"
                optionValue="id"
                optionLabel="name"
                placeholder="Filtro per fornitore"
                :showClear="true"
                :loading="suppliersLoading"
              />

              <Button
                v-if="totalDrafts > 0"
                :label="'Bozze (' + totalDrafts + ')'"
                icon="pi pi-pen-to-square"
                :disabled="!!_status"
                severity="warn"
                variant="text"
                @click="onStatus('DRAFT')"
              />
            </div>
            <Button
              label="Rimuovi filtri"
              icon="pi pi-filter-slash"
              :disabled="!_status && !_supplierId"
              severity="secondary"
              variant="text"
              @click="onFilter(undefined, undefined)"
            />
          </div>
        </template>
        <template #empty>Nessuna fattura trovata.</template>
        <template #loading>Caricando le fatture...</template>
        <Column header="Data"><template #body="{ data }">{{formatDate(data.date)}}</template></Column>
        <Column>
          <template #header>
            <span class="p-datatable-column-title flex items-center group">
              Fornitore
              <span class="ml-4">
                <span :class="_supplierId ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (_supplierId ? 'pi-filter-fill' : 'pi-filter') "></i>
                </span>
                <span
                  :class="'hidden ' + (_supplierId ? 'group-hover:inline-block cursor-pointer' : '')">
                  <i class="pi pi-filter-slash" @click="onSupplier(undefined)"></i>
                </span>
              </span>
            </span>
          </template>

          <template #body="{ data }">
            <p v-if="suppliers && data.supplierId">{{ suppliers.find((supplier) => supplier.id === data.supplierId)?.name }}</p>
          </template>
        </Column>
        <Column field="number" header="Numero"></Column>
        <Column header="Importo">
          <template #body="{ data }">
            <p v-if="data.amount">
              {{
                data.amount.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                })
              }}
            </p>
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
              Stato
              <span class="ml-4">
                <span :class="_status ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (_status ? 'pi-filter-fill' : 'pi-filter') "></i>
                </span>
                <span
                  :class="'hidden ' + (_status ? 'group-hover:inline-block cursor-pointer' : '')">
                  <i class="pi pi-filter-slash" @click="onStatus(undefined)"></i>
                </span>
              </span>
            </span>
          </template>
          <template #body="{ data }">
            <Tag
              v-if="data.status && data.status !== 'COMPLETED'"
              :value="constants.draft.label"
              :severity="constants.draft.severity"
            />
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
  type DataTableFilterMetaData,
  type DataTablePageEvent,
  type DataTableRowSelectEvent,
  Select,
  Tag
} from 'primevue'
import { computed, onMounted, ref, type Ref, watch } from 'vue'
import { useIncomingInvoicesTable } from '@/composables/useIncomingInvoicesTable'
import { useIncomingInvoicesTableConstants } from '@/utils/i18nConstants'
import { useSuppliers } from '@/composables/useSuppliers'
import { FilterMatchMode } from '@primevue/core/api'
import { formatDate } from '@/utils/dateUtils.ts'

const constants = useIncomingInvoicesTableConstants()

const { incomingInvoices, totalDrafts, loadIncomingInvoices, loading } =
  useIncomingInvoicesTable()

const { suppliers, loadSuppliers, loading: suppliersLoading } = useSuppliers()

const props = defineProps<{
  filter: {
    page: number
    size: number
    first: number
    supplierId?: number
    status?: string
  }
}>()

const emit = defineEmits<{
  page: [page: number, size: number]
  rowSelect: [id?: number, edit?: boolean]
  filter: [supplierId?: number, status?: string]
}>()

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  loadSuppliers()
  loadIncomingInvoices()

  const { supplierId, status } = props.filter
  setFilter(supplierId, status)
})

// La logica di load è stata messa nel watch per effettuare la chiamata anche a seguito del click su
// sidebar. Mettendo il listener sulle proprietà, è stato rimosso il load dall'onPage e onFormSubmit
watch(
  () => props.filter,
  (value) => {
    setFilter(value.supplierId, value.status)
  }
)

const onRowSelect = (data: DataTableRowSelectEvent): void => {
  emit('rowSelect', data.data.id, false)
}

const filters: Ref<DataTableFilterMeta> = ref({
  supplierId: { value: undefined, matchMode: FilterMatchMode.EQUALS },
  status: { value: undefined, matchMode: FilterMatchMode.EQUALS }
})

const _supplierId = computed({
  get: (): number | undefined => getFilterValue<number>('supplierId'),
  set: (value?: number): void => setFilterValue<number>('supplierId', value)
})

const _status = computed({
  get: (): string | undefined => getFilterValue<string>('status'),
  set: (value?: string): void => setFilterValue<string>('status', value)
})

const getFilterValue = <T>(field: string): T | undefined => {
  return (filters.value[field] as DataTableFilterMetaData).value
}

const setFilterValue = <T>(field: string, value?: T): void => {
  (filters.value[field] as DataTableFilterMetaData).value = value
}

const setFilter = (supplierId?: number, status?: string): void => {
  _supplierId.value = supplierId
  _status.value = status
}

const onSupplier = (supplierId?: number): void => {
  onFilter(supplierId, _status.value)
}

const onStatus = (status?: string): void => {
  onFilter(_supplierId.value, status)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows
  emit('page', page, rows)
}

const onFilter = (supplierId?: number, status?: string): void => {
  emit('filter', supplierId, status)
}

</script>
