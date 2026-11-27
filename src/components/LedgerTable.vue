<template>
  <Card>
    <template #content>
      <!-- TODO Da telefono fa un po' cagare -->
      <DataTable
        v-model:filters="filters"
        :value="rows"
        :paginator="rows.length > props.filter.size"
        @page="onPage"
        :rows="props.filter.size"
        :first="props.filter.first"
        dataKey="id"
        :loading
        rowHover
        :globalFilterFields="['date']"
        selectionMode="single"
        @rowSelect="onRowSelect"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Da data -->
              <InputDateField
                v-model="searchFormItem.fromDate"
                inputId="fromDate"
                :label="constants.fromDate.label"
                :validation="validation.fields.fromDate"
                clearable
              />

              <!-- A data -->
              <InputDateField
                v-model="searchFormItem.toDate"
                inputId="toDate"
                :label="constants.toDate.label"
                :validation="validation.fields.toDate"
                clearable
              />

              <!-- Stampa del periodo filtrato -->
              <Button
                v-if="hasDateFilter"
                type="button"
                rounded
                text
                :icon="constants.print.icon"
                severity="secondary"
                :aria-label="constants.print.label"
                v-tooltip.top="constants.print.label"
                @click="onPrint"
              />
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <Button
                v-if="hasDateFilter || _archived || _status"
                label="Rimuovi filtri"
                icon="pi pi-filter-slash"
                severity="secondary"
                variant="text"
                @click="onFilter(undefined, undefined, false, '')"
              />
              <SelectField
                v-if="viewOptions.length"
                v-model="_view"
                inputId="view"
                :options="viewOptions"
                optionValue="value"
                optionLabel="label"
                showClear
                label="Stato"
                :optionSeverity="(option) => option.severity"
                class="w-56"
              />
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
            <p v-if="data.bankId">{{ getBankName(data.bankId) }}</p>
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
        <Column header="Stato">
          <template #body="{ data }">
            <Tag
              v-if="constants.status[statusOf(data)]"
              :value="constants.status[statusOf(data)].label"
              :severity="constants.status[statusOf(data)].severity"
            />
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
  Tag,
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
import { useRoles } from '@/composables/useRoles'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { type FromDateToDate, useSearchForm } from '@/composables/useSearchForm'
import { formatDate, parseDate } from '@/utils/dateUtils'
import SelectField from './layout/fields/SelectField.vue'

const constants = useLedgerTableConstants()

const { ledger, archivedLedger, totalArchived, totalPending, loadLedger, loading } =
  useLedgerTable()
const { isAdmin } = useRoles()
const { banks, loadBanks, loading: banksLoading } = useBanks()

const props = defineProps<{
  filter: {
    page: number
    size: number
    year: number
    first: number
    from?: string
    to?: string
    archived?: boolean
    status?: string
  }
}>()

const emit = defineEmits<{
  page: [page: number, size: number]
  year: [year: number]
  rowSelect: [id?: number, edit?: boolean]
  filter: [from?: Date, to?: Date, archived?: boolean, status?: string]
  print: [from: Date, to: Date]
}>()

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  const { year, from, to } = props.filter

  loadBanks()
  loadLedger(year)

  setFilter(from, to)
})

const banksMap = computed(() => {
  const map = new Map<number, string>()
  banks.value.forEach((bank) => {
    if (bank.id && bank.name) {
      map.set(bank.id, bank.name)
    }
  })
  return map
})

const getBankName = (bankId?: number): string | undefined => {
  return bankId ? banksMap.value.get(bankId) : undefined
}

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

const _archived = computed({
  get: (): boolean => !!props.filter.archived && isAdmin,
  set: (value: boolean): void =>
    onFilter(searchFormItem.value.fromDate, searchFormItem.value.toDate, value, ''),
})

const _status = computed({
  get: (): string | undefined => props.filter.status,
  set: (value?: string): void =>
    onFilter(
      searchFormItem.value.fromDate,
      searchFormItem.value.toDate,
      _archived.value,
      value ?? '',
    ),
})

// Un solo filtro per la vista: bozze/da confermare ed eliminate si escludono a vicenda
const _view = computed({
  get: (): string | undefined => (_archived.value ? 'ARCHIVED' : _status.value || undefined),
  set: (v?: string): void =>
    onFilter(
      searchFormItem.value.fromDate,
      searchFormItem.value.toDate,
      v === 'ARCHIVED',
      v && v !== 'ARCHIVED' ? v : '',
    ),
})

const viewOptions = computed(() =>
  [
    {
      value: 'PENDING',
      severity: constants.status.PENDING.severity,
      label: constants.status.PENDING.label + ' (' + totalPending.value + ')',
      show: totalPending.value > 0,
    },
    {
      value: 'ARCHIVED',
      severity: constants.status.ARCHIVED.severity,
      label: constants.status.ARCHIVED.label + ' (' + totalArchived.value + ')',
      show: isAdmin && totalArchived.value > 0,
    },
  ].filter((option) => option.show || option.value === _view.value),
)

const rows = computed(() => {
  if (_archived.value) return archivedLedger.value
  return _status.value ? ledger.value.filter((e) => e.status === _status.value) : ledger.value
})

const statusOf = (data: { status?: string }) => (_archived.value ? 'ARCHIVED' : (data.status ?? ''))

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

const onPage = (event: DataTablePageEvent): void => {
  const rows = event.rows
  const page = event.first / rows
  emit('page', page, rows)
}

const onFilter = (
  from?: Date,
  to?: Date,
  archived: boolean = _archived.value,
  status: string | undefined = _status.value,
): void => {
  emit('filter', from, to, archived, status)
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

// Ricerca automatica: parte quando entrambe le date sono valorizzate e cambiate
watch(
  () => [searchFormItem.value.fromDate?.getTime(), searchFormItem.value.toDate?.getTime()],
  ([from, to]) => {
    const applied = (value?: string) => (value ? parseDate(value, '-')?.getTime() : undefined)
    if (from === applied(props.filter.from) && to === applied(props.filter.to)) return
    if (from && to) onFormSubmit()
    else if (!from && !to) onFilter(undefined, undefined)
  },
)
</script>
