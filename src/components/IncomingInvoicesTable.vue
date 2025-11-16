<template>
  <Card>
    <template #content>
      <!-- TODO Da telefono fa un po' cagare -->
      <DataTable
        v-model:filters="filters"
        :value="incomingInvoices"
        paginator
        @page="onPage"
        :rows="filter.size"
        :first="filter.first"
        :totalRecords
        lazy
        tableStyle="min-width: 50rem"
        scrollable
        scroll-height="flex"
        dataKey="id"
        :loading
        rowHover
        filterDisplay="menu"
        :globalFilterFields="['status']"
        @update:filters="onFilter"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              label="Rimuovi filtri"
              icon="pi pi-filter-slash"
              :disabled="!filter.status && !filter.supplier"
              severity="secondary"
              variant="text"
              @click="onStatus(undefined)"
            />

            <Button
              v-if="totalDrafts > 0"
              :label="'Bozze (' + totalDrafts + ')'"
              icon="pi pi-pen-to-square"
              :disabled="!!filter.status"
              severity="warn"
              variant="text"
              @click="onStatus('DRAFT')"
            />
          </div>
        </template>
        <template #empty>Nessuna fattura trovata.</template>
        <template #loading>Caricando le fatture...</template>
        <Column field="date" header="Data"></Column>
        <!-- TODO: Implementare filtro con elenco fornitori -->
        <Column field="supplier.name" header="Fornitore"></Column>
        <Column field="number" header="Numero"></Column>
        <Column header="Importo">
          <template #body="{ data }">
            <p v-if="data.amount">
              {{
                data.amount.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                })
              }}
            </p>
          </template>
        </Column>
        <Column
          field="status"
          header="Stato"
          class="w-24"
          :showFilterMatchModes="false"
          :showClearButton="false"
          :showApplyButton="false"
        >
          <template #body="{ data }">
            <Tag
              v-if="data.status && data.status !== 'COMPLETED'"
              :value="constants.draft.label"
              :severity="constants.draft.severity"
            />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="['DRAFT']"
              placeholder="Selezionane uno"
              :showClear="true"
            >
              <template #option="{ option }">
                <Tag :value="option" :severity="'warn'" />
              </template>
            </Select>
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
              <Button
                v-show="isEditable(data)"
                type="button"
                icon="pi pi-pencil"
                @click="onRowSelect(data, true)"
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
  Card,
  Column,
  DataTable,
  type DataTablePageEvent,
  Tag,
  Button,
  Select,
  type DataTableFilterMeta,
} from 'primevue'
import { onMounted, type Ref, ref, watch } from 'vue'
import { useIncomingInvoicesTable } from '@/composables/useIncomingInvoicesTable.ts'
import { useIncomingInvoicesTableConstants } from '@/utils/i18nConstants.ts'
import { isEditable, type IncomingInvoice } from '@/types/incomingInvoice.ts'
import { FilterMatchMode } from '@primevue/core/api'
import type { DataTableFilterMetaData } from 'primevue/datatable'

const constants = useIncomingInvoicesTableConstants()

const { incomingInvoices, totalRecords, totalDrafts, loadIncomingInvoices, loading } =
  useIncomingInvoicesTable()

const props = defineProps<{
  filter: {
    page: number
    size: number
    first: number
    supplier?: string
    status?: string
  }
}>()

const emit = defineEmits(['page', 'rowSelect', 'filter'])

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  const { page, size, supplier, status } = props.filter
  reload(page, size, supplier, status)
})

// La logica di load è stata messa nel watch per effettuare la chiamata anche a seguito del click su
// sidebar. Mettendo il listener sulle proprietà, è stato rimosso il load dall'onPage e onFormSubmit
watch(
  () => props.filter,
  (value) => {
    reload(value.page, value.size, value.supplier, value.status)
  },
)

const reload = (page?: number, size?: number, supplier?: string, status?: string) => {
  updateFilters(supplier, status)
  loadIncomingInvoices(page, size, supplier, status)
}

const onRowSelect = (data: IncomingInvoice, edit: boolean): void => {
  emit('rowSelect', data.id, edit)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows

  emit('page', page, rows)
}

const onStatus = (status?: string) => {
  emit('filter', undefined, status)
}

const onFilter = (any: DataTableFilterMeta) => {
  const supplier = (any['supplier'] as DataTableFilterMetaData).value
  const status = (any['status'] as DataTableFilterMetaData).value
  emit('filter', supplier, status)
}

const filters: Ref<DataTableFilterMeta> = ref({})

const updateFilters = (supplier?: string, status?: string) => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    supplier: { value: supplier, matchMode: FilterMatchMode.STARTS_WITH },
    status: { value: status, matchMode: FilterMatchMode.EQUALS },
  }
}
</script>
