<template>
  <Card>
    <template #content>
      <!-- TODO Da telefono fa un po' cagare -->
      <DataTable
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
      >
        <template #header>
          <div class="flex justify-between">
            <Select
              v-model="filter.supplierId"
              @change="onSupplier"
              :options="suppliers"
              optionValue="id"
              optionLabel="name"
              placeholder="Filtro per fornitore"
              :showClear="true"
              :loading="suppliersLoading"
            />

            <div class="flex gap-4">

              <Button
                label="Rimuovi filtri"
                icon="pi pi-filter-slash"
                :disabled="!filter.status && !filter.supplierId"
                severity="secondary"
                variant="text"
                @click="emit('filter', undefined, undefined)"
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

          </div>
        </template>
        <template #empty>Nessuna fattura trovata.</template>
        <template #loading>Caricando le fatture...</template>
        <Column field="date" header="Data"></Column>
        <Column>
          <template #header>
            <span class="p-datatable-column-title flex items-center group">
              Fornitore
              <span class="ml-4">
                <span :class="filter.supplierId ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (filter.supplierId ? 'pi-filter-fill' : 'pi-filter') "></i>
                </span>
                <span :class="'hidden ' + (filter.supplierId ? 'group-hover:inline-block cursor-pointer' : '')">
                  <i class="pi pi-filter-slash" @click="onSupplier(undefined)"></i>
                </span>
              </span>
            </span>
          </template>

          <template #body="{ data }">
            <p v-if="data.supplier && data.supplier.name">{{ data.supplier.name }}</p>
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
                <span :class="filter.status ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (filter.status ? 'pi-filter-fill' : 'pi-filter') "></i>
                </span>
                <span :class="'hidden ' + (filter.status ? 'group-hover:inline-block cursor-pointer' : '')">
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
  Button,
  Card,
  Column,
  DataTable,
  type DataTablePageEvent,
  Select,
  type SelectChangeEvent,
  Tag
} from 'primevue'
import { onMounted, watch } from 'vue'
import type { IncomingInvoice } from '@/types/incomingInvoice'
import { isEditable } from '@/types/incomingInvoice'
import { useIncomingInvoicesTable } from '@/composables/useIncomingInvoicesTable'
import { useIncomingInvoicesTableConstants } from '@/utils/i18nConstants'
import { useSuppliers } from '@/composables/useSuppliers'

const constants = useIncomingInvoicesTableConstants()

const { incomingInvoices, totalRecords, totalDrafts, loadIncomingInvoices, loading } =
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
  const { page, size, supplierId, status } = props.filter
  reload(page, size, supplierId, status)
})

// La logica di load è stata messa nel watch per effettuare la chiamata anche a seguito del click su
// sidebar. Mettendo il listener sulle proprietà, è stato rimosso il load dall'onPage e onFormSubmit
watch(
  () => props.filter,
  (value) => {
    reload(value.page, value.size, value.supplierId, value.status)
  }
)

const reload = (page?: number, size?: number, supplierId?: number, status?: string) => {
  loadIncomingInvoices(page, size, undefined, supplierId, status)
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
  emit('filter', props.filter.supplierId, status)
}

const onSupplier = (event?: SelectChangeEvent) => {
  emit('filter', event ? event.value : undefined, props.filter.status)
}

</script>
