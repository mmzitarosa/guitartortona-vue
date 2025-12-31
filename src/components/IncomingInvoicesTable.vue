<template>
  <Card>
    <template #content>
      <!-- TODO Da telefono fa un po' cagare -->
      <DataTable
        v-model:filters="filters"
        :value="incomingInvoices"
        :paginator="incomingInvoices.length > props.filter.size"
        @page="onPage"
        :rows="props.filter.size"
        :first="props.filter.first"
        dataKey="id"
        :loading
        rowHover
        :globalFilterFields="['supplierId', 'status']"
        selectionMode="single"
        @rowSelect="onRowSelect"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              label="Rimuovi filtri"
              icon="pi pi-filter-slash"
              :disabled="!_status && !_supplierId"
              severity="secondary"
              variant="text"
              @click="onFilter(undefined, undefined)"
            />

            <div class="flex gap-4">
              <Button
                v-if="totalDrafts > 0"
                :label="'Bozze (' + totalDrafts + ')'"
                icon="pi pi-pen-to-square"
                :disabled="!!_status"
                severity="warn"
                variant="text"
                @click="_status = 'DRAFT'"
              />

              <SelectField
                v-model="_supplierId"
                inputId="supplier"
                :options="suppliers"
                optionValue="id"
                optionLabel="name"
                showClear
                :loading="suppliersLoading"
                label="Filtro per Fornitore"
                class="w-64"
              />
            </div>
          </div>
        </template>
        <template #empty>Nessuna fattura trovata.</template>
        <template #loading>Caricando le fatture...</template>
        <Column header="Data"
          ><template #body="{ data }">{{ formatDate(data.date) }}</template></Column
        >
        <Column>
          <template #header>
            <span class="p-datatable-column-title flex items-center group">
              Fornitore
              <span class="ml-4">
                <span :class="_supplierId ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (_supplierId ? 'pi-filter-fill' : 'pi-filter')"></i>
                </span>
                <span
                  :class="
                    'hidden ' + (_supplierId ? 'group-hover:inline-block cursor-pointer' : '')
                  "
                >
                  <i class="pi pi-filter-slash" @click="_supplierId = undefined"></i>
                </span>
              </span>
            </span>
          </template>

          <template #body="{ data }">
            <p v-if="data.supplierId">{{ getSupplierName(data.supplierId) }}</p>
          </template>
        </Column>
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
              v-if="data && data.status === 'DRAFT'"
              :value="constants.draft.label"
              :severity="constants.draft.severity"
            />
            <Tag
              v-else-if="data && data.status === 'COMPLETED'"
              :value="constants.completed.label"
              :severity="constants.completed.severity"
            />
            <Tag v-else :value="constants.other.label" :severity="constants.other.severity" />
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
  Tag,
} from 'primevue'
import { computed, onMounted } from 'vue'
import { useIncomingInvoicesTable } from '@/composables/useIncomingInvoicesTable'
import { useIncomingInvoicesTableConstants } from '@/utils/i18nConstants'
import { useSuppliers } from '@/composables/useSuppliers'
import { FilterMatchMode } from '@primevue/core/api'
import { formatDate } from '@/utils/dateUtils'
import SelectField from '@/components/layout/fields/SelectField.vue'

const constants = useIncomingInvoicesTableConstants()

const { incomingInvoices, totalDrafts, loadIncomingInvoices, loading } = useIncomingInvoicesTable()

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
})

const suppliersMap = computed(() => {
  const map = new Map<number, string>()
  suppliers.value.forEach((supplier) => {
    if (supplier.id && supplier.name) {
      map.set(supplier.id, supplier.name)
    }
  })
  return map
})

const getSupplierName = (supplierId?: number): string | undefined => {
  return supplierId ? suppliersMap.value.get(supplierId) : undefined
}

const onRowSelect = (data: DataTableRowSelectEvent): void => {
  emit('rowSelect', data.data.id, false)
}

const filters = computed((): DataTableFilterMeta => {
  return {
    supplierId: { value: props.filter.supplierId, matchMode: FilterMatchMode.EQUALS },
    status: { value: props.filter.status, matchMode: FilterMatchMode.EQUALS },
  }
})

const _supplierId = computed({
  get: (): number | undefined => props.filter.supplierId,
  set: (value?: number): void => onFilter(value, _status.value),
})

const _status = computed({
  get: (): string | undefined => props.filter.status,
  set: (value?: string): void => onFilter(_supplierId.value, value),
})

const onPage = (event: DataTablePageEvent): void => {
  const rows = event.rows
  const page = event.first / rows
  emit('page', page, rows)
}

const onFilter = (supplierId?: number, status?: string): void => {
  emit('filter', supplierId, status)
}
</script>
