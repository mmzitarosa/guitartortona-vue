<template>
  <Card>
    <template #content>
      <!-- TODO Da telefono fa un po' cagare -->
      <DataTable
        v-model:filters="filters"
        :value="ledger"
        :paginator="ledger.length > filter.size"
        @page="onPage"
        :rows="filter.size"
        :first="filter.first"
        dataKey="id"
        :loading
        rowHover
        :globalFilterFields="['date']"
        selectionMode="single"
        @rowSelect="onRowSelect"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              label="Rimuovi filtri"
              icon="pi pi-filter-slash"
              :disabled="!hasDateFilter"
              severity="secondary"
              variant="text"
              @click="onFilter(undefined, undefined)"
            />

            <div class="flex gap-4">
              <!-- Da data -->
              <InputDateField
                v-model="searchFormItem.fromDate"
                inputId="fromDate"
                :label="constants.fromDate.label"
                :validation="validation.fields.fromDate"
              />

              <!-- A data -->
              <InputDateField
                v-model="searchFormItem.toDate"
                inputId="toDate"
                :label="constants.toDate.label"
                :validation="validation.fields.toDate"
              />

              <div>
                <!-- Messo tutto dentro un div per evitare che si allunghino, adeguandosi all'altezza dei due input -->
                <Button
                  v-if="hasDateFilter"
                  type="button"
                  :icon="constants.print.icon"
                  severity="secondary"
                  @click="onPrint"
                  class="mr-2"
                />
                <Button type="button" :icon="constants.search.icon" @click="onFormSubmit" />
              </div>
            </div>
          </div>
        </template>
        <template #empty>Nessun record trovato.</template>
        <template #loading>Caricando i record...</template>

        <Column>
          <template #header>
            <span class="p-datatable-column-title flex items-center group">
              Data
              <span class="ml-4">
                <span :class="hasDateFilter ? 'group-hover:hidden' : ''">
                  <i :class="'pi ' + (hasDateFilter ? 'pi-filter-fill' : 'pi-filter')"></i>
                </span>
                <span
                  :class="
                    'hidden ' + (hasDateFilter ? 'group-hover:inline-block cursor-pointer' : '')
                  "
                >
                  <i class="pi pi-filter-slash" @click="onFilter(undefined, undefined)"></i>
                </span>
              </span>
            </span>
          </template>

          <template #body="{ data }">{{ formatDate(data.date) }}</template>
        </Column>
        <Column field="invoiceNumber" header="NumeroF"></Column>
        <Column header="DataF"
          ><template #body="{ data }">{{ formatDate(data.invoiceDate) }}</template></Column
        >
        <Column field="description" header="Descrizione"></Column>
        <Column field="reason" header="Causale"></Column>

        <Column header="Banca">
          <template #body="{ data }">
            <p v-if="banks && data.bankId">
              {{ banks.find((bank) => bank.id === data.bankId)?.name }}
            </p>
          </template>
        </Column>
        <Column header="S/A" bodyStyle="text-align:center">
          <template #body="slotProps">
            {{
              slotProps.data.paymentType
                ? paymentTypesMap[slotProps.data.paymentType].char
                : undefined
            }}
          </template>
        </Column>
        <Column field="receiptNumber" header="Ultime3" bodyStyle="text-align:center"></Column>
        <Column header="Importo" bodyStyle="text-align:right">
          <template #body="{ data }">
            <p
              v-if="data.amount && data.movementType"
              :class="movementTypesMap[data.movementType].style"
            >
              {{
                movementTypesMap[data.movementType].char +
                data.amount.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                })
              }}
            </p>
          </template>
        </Column>
        <Column class="pl-0!">
          <template #body="{ data }">
            <i v-if="data.paymentMethod" :class="paymentMethodsMap[data.paymentMethod].icon"></i>
          </template>
        </Column>
        <template #footer>
          <div class="flex justify-end">
            <SelectField
              v-model="_year"
              inputId="year"
              :options="yearsOptions"
              optionValue="id"
              optionLabel="value"
              label="Periodo"
              class="w-64"
            />
          </div>
        </template>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref, watch } from 'vue'
import {
  Button,
  Card,
  Column,
  DataTable,
  type DataTableFilterMeta,
  type DataTableFilterMetaData,
  type DataTableOperatorFilterMetaData,
  type DataTablePageEvent,
  type DataTableRowSelectEvent,
} from 'primevue'
import { movementTypesMap, paymentMethodsMap, paymentTypesMap } from '@/types/ledgerEntry'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import { useLedgerTable } from '@/composables/useLedgerTable'
import { useLedgerTableConstants } from '@/utils/i18nConstants'
import { useBanks } from '@/composables/useBanks'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { type FromDateToDate, useSearchForm } from '@/composables/useSearchForm'
import { formatDate, parseDate } from '@/utils/dateUtils'
import SelectField from './layout/fields/SelectField.vue'

const constants = useLedgerTableConstants()

const { ledger, totalDrafts, loadLedger, loading } = useLedgerTable()
const { banks, loadBanks, loading: banksLoading } = useBanks()

const props = defineProps<{
  filter: {
    page: number
    size: number
    year: number
    first: number
    from?: string
    to?: string
  }
}>()

const emit = defineEmits<{
  page: [page: number, size: number]
  year: [year: number]
  rowSelect: [id?: number, edit?: boolean]
  filter: [from?: Date, to?: Date]
  print: [from: Date, to: Date]
}>()

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  const { year, from, to } = props.filter

  loadBanks()
  loadLedger(year)

  setFilter(from, to)
})

watch(
  () => props.filter,
  (value, oldValue) => {
    if (value.year !== oldValue.year) loadLedger(value.year)

    setFilter(value.from, value.to)
  },
)

const onRowSelect = (data: DataTableRowSelectEvent): void => {
  emit('rowSelect', data.data.id, false)
}

const filters: Ref<DataTableFilterMeta> = ref({
  date: {
    operator: FilterOperator.AND,
    constraints: [],
  },
})

const _year = computed({
  get: (): number => props.filter.year,
  set: (value: number): void => emit('year', value),
})

const setFilter = (from?: string, to?: string): void => {
  searchFormItem.value.fromDate = from ? parseDate(from, '-') : undefined
  searchFormItem.value.toDate = to ? parseDate(to, '-') : undefined

  const newConstraints: DataTableFilterMetaData[] = []
  newConstraints.push({
    value: searchFormItem.value.fromDate,
    matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
  })
  newConstraints.push({
    value: searchFormItem.value.toDate,
    matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
  })
  ;(filters.value['date'] as DataTableOperatorFilterMetaData).constraints = newConstraints
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows
  emit('page', page, rows)
}

const onFilter = (from?: Date, to?: Date): void => {
  emit('filter', from, to)
}

// DateForm
const onFormSubmit = () => {
  const result = handleSubmit()
  if (!result) return
  onFilter(result.from, result.to)
}

const hasDateFilter = computed(() => {
  return props.filter.from && props.filter.to
})

const onPrint = () => {
  if (hasDateFilter.value)
    emit('print', searchFormItem.value.fromDate!, searchFormItem.value.toDate!)
}

const yearsOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return [
    { value: `Ultimo anno (${currentYear - 1}-${currentYear})`, id: currentYear - 1 },
    { value: `Ultimi 2 anni (${currentYear - 2}-${currentYear})`, id: currentYear - 2 },
    { value: `Ultimi 3 anni (${currentYear - 3}-${currentYear})`, id: currentYear - 3 },
    { value: `Ultimi 4 anni (${currentYear - 4}-${currentYear})`, id: currentYear - 4 },
    { value: 'Tutti i dati', id: 2014 },
  ]
})

const {
  item: searchFormItem,
  validation,
  handleSubmit,
} = useSearchForm<FromDateToDate>({
  fieldMappings: [
    {
      key: 'fromDate',
      label: constants.fromDate.label,
      labeler: (fromDate: Date | undefined) => formatDate(fromDate),
      validator: (fromDate: Date | undefined) => {
        if (!fromDate) return { message: constants.fromDate.messages.required }
        if (searchFormItem.value.toDate && fromDate > searchFormItem.value.toDate) {
          return { message: constants.fromDate.messages.invalid }
        }
        if (_year.value > fromDate.getFullYear())
          return { message: constants.fromDate.messages.beforeYear }
      },
    },
    {
      key: 'toDate',
      label: constants.toDate.label,
      labeler: (toDate: Date | undefined) => formatDate(toDate),
      validator: (toDate: Date | undefined) => {
        if (!toDate) return { message: constants.toDate.messages.required }
        else if (searchFormItem.value.fromDate && searchFormItem.value.fromDate > toDate)
          return { message: constants.toDate.messages.beforeFromDate }
      },
    },
  ],
  onSubmit: (item: FromDateToDate) => {
    const from = item.fromDate
    const to = item.toDate
    return { from, to }
  },
})
</script>
