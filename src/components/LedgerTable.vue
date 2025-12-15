<template>
  <Card>
    <template #content>
      <!-- Filtro per data-->
      <div class="flex gap-4 pb-4 justify-end">
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
          <Button
            v-if="hasDateFilter"
            type="button"
            :icon="constants.reset.icon"
            severity="secondary"
            @click="onFilter(undefined, undefined)"
            class="mr-2"
          />
          <Button type="button" :icon="constants.search.icon" @click="onFormSubmit" />
        </div>
      </div>

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
      >

        <!-- v-model:filters="filters"
        stripedRows
        :globalFilterFields="['supplierId', 'status']"
         -->

        <Column header="Data"><template #body="{ data }">{{formatDate(data.date)}}</template></Column>
        <Column field="invoiceNumber" header="NumeroF"></Column>
        <Column header="DataF"><template #body="{ data }">{{formatDate(data.invoiceDate)}}</template></Column>
        <Column field="description" header="Descrizione"></Column>
        <Column field="reason" header="Causale"></Column>
        <Column field="bank.name" header="Banca"></Column>
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
                  currency: 'EUR'
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
  type DataTablePageEvent
} from 'primevue'
import {
  type LedgerEntry,
  movementTypesMap,
  paymentMethodsMap,
  paymentTypesMap
} from '@/types/ledgerEntry'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import { useLedgerTable } from '@/composables/useLedgerTable'
import { print } from '@/services/api/ledgerService'
import { useLedgerTableConstants } from '@/utils/i18nConstants'
import { useBanks } from '@/composables/useBanks'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { type FromDateToDate, useSearchForm } from '@/composables/useSearchForm'
import { formatDate, parseDate } from '@/utils/dateUtils'

const constants = useLedgerTableConstants()

const { ledger, totalDrafts, loadLedger, loading } = useLedgerTable()
const { banks, loadBanks, loading: banksLoading } = useBanks()

const props = defineProps<{
  filter: {
    page: number
    size: number
    first: number
    from?: string
    to?: string
  }
}>()

const emit = defineEmits<{
  page: [page: number, size: number]
  rowSelect: [id?: number, edit?: boolean]
  filter: [from?: Date, to?: Date]
  print: [from: Date, to: Date]
}>()

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  loadBanks()
  loadLedger()

  const { from, to } = props.filter
  setFilter(from, to)
})

watch(
  () => props.filter,
  (value) => {
    setFilter(value.from, value.to)
  }
)

const onRowSelect = (data: LedgerEntry, edit: boolean): void => {
  emit('rowSelect', data.id, edit)
}

const filters: Ref<DataTableFilterMeta> = ref({
  date: {
    operator: FilterOperator.AND,
    constraints: []
  }
})


const setFilter = (from?: string, to?: string): void => {
  searchFormItem.value.fromDate = from ? parseDate(from, "-") : undefined
  searchFormItem.value.toDate = to ? parseDate(to, "-") : undefined

  const newConstraints: DataTableFilterMetaData[] = []
  newConstraints.push({ value: searchFormItem.value.fromDate, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO });
  newConstraints.push({ value: searchFormItem.value.toDate, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO });
  (filters.value['date'] as DataTableOperatorFilterMetaData).constraints = newConstraints
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
  if (hasDateFilter.value) emit('print', searchFormItem.value.fromDate!, searchFormItem.value.toDate!)
}

const {
  item: searchFormItem,
  validation,
  handleSubmit,
  handleReset
} = useSearchForm<FromDateToDate>({
  fieldMappings: [
    {
      key: 'fromDate',
      label: constants.fromDate.label,
      validator: (fromDate: Date | undefined) => {
        if (!fromDate) return { message: constants.fromDate.messages.required }
        if (searchFormItem.value.toDate && fromDate > searchFormItem.value.toDate) {
          return { message: constants.fromDate.messages.invalid }
        }
      }
    },
    {
      key: 'toDate',
      label: constants.toDate.label,
      validator: (toDate: Date | undefined) => {
        if (!toDate) return { message: constants.toDate.messages.required }
        else if (searchFormItem.value.fromDate && searchFormItem.value.fromDate > toDate)
          return { message: constants.toDate.messages.beforeFromDate }
      }
    }
  ],
  onSubmit: (item: FromDateToDate) => {
    const from = item.fromDate
    const to = item.toDate
    return { from, to }
  }
})
</script>
