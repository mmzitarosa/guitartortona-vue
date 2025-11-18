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
            @click="printTable"
            class="mr-2"
          />
          <Button
            v-if="hasDateFilter"
            type="button"
            :icon="constants.reset.icon"
            severity="secondary"
            @click="onFormReset"
            class="mr-2"
          />
          <Button type="button" :icon="constants.search.icon" @click="onFormSubmit" />
        </div>
      </div>

      <!-- TODO Da telefono fa un po' cagare -->
      <DataTable
        v-model:selection="selectedLedgerEntry"
        :value="ledger"
        paginator
        @page="onPage"
        :rows="filter.size"
        :first="filter.first"
        :totalRecords
        lazy
        tableStyle="min-width: 50rem"
        stripedRows
        scrollable
        scroll-height="flex"
        selectionMode="single"
        dataKey="id"
        @rowSelect="onRowSelect"
        :loading
        rowHover
      >
        <Column field="date" header="Data"></Column>
        <Column field="invoiceNumber" header="NumeroF"></Column>
        <Column field="invoiceDate" header="DataF"></Column>
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
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { Button, Card, Column, DataTable, type DataTablePageEvent } from 'primevue'
import { movementTypesMap, paymentMethodsMap, paymentTypesMap } from '@/types/ledgerEntry'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import { useLedgerTable } from '@/composables/useLedgerTable'
import { useSearchForm, type FromDateToDate } from '@/composables/useSearchForm'
import { print } from '@/services/api/ledgerService'
import { validateDate } from '@/utils/dateUtils'
import { useLedgerTableConstants } from '@/utils/i18nConstants'

const constants = useLedgerTableConstants()

const { ledger, selectedLedgerEntry, totalRecords, loadLedger, loading } = useLedgerTable()

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
  search: [from?: string, to?: string]
  page: [page: number, size: number]
  rowSelect: [id?: number]
  reset: []
}>()

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  const { from, to, page, size } = props.filter
  reload(from, to, page, size)
})

// La logica di load è stata messa nel watch per effettuare la chiamata anche a seguito del click su
// sidebar. Mettendo il listener sulle proprietà, è stato rimosso il load dall'onPage e onFormSubmit
watch(
  () => props.filter,
  (value) => {
    reload(value.from, value.to, value.page, value.size)
  },
)

const reload = (from?: string, to?: string, page?: number, size?: number) => {
  searchFormItem.value.fromDate = from?.replace(/-/g, '/')
  searchFormItem.value.toDate = to?.replace(/-/g, '/')
  loadLedger(from, to, page, size, undefined)
}

const onRowSelect = (): void => {
  emit('rowSelect', selectedLedgerEntry.value?.id)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows

  emit('page', page, rows)
}

// DateForm
const onFormSubmit = () => {
  const result = handleSubmit()
  if (!result) return
  emit('search', result.from, result.to)
}

const onFormReset = () => {
  handleReset()
  emit('reset')
}

const hasDateFilter = computed(() => {
  return props.filter.from && props.filter.to
})

const printTable = () => {
  if (hasDateFilter.value) print(props.filter.from!, props.filter.to!)
}

const {
  item: searchFormItem,
  validation,
  handleSubmit,
  handleReset,
} = useSearchForm<FromDateToDate>({
  fieldMappings: [
    {
      key: 'fromDate',
      label: constants.fromDate.label,
      validator: (fromDate: string | undefined) => {
        if (!fromDate) return { message: constants.fromDate.messages.required }
        else if (
          !validateDate(fromDate) ||
          (searchFormItem.value.toDate && fromDate > searchFormItem.value.toDate)
        )
          return { message: constants.fromDate.messages.invalid }
      },
    },
    {
      key: 'toDate',
      label: constants.toDate.label,
      validator: (toDate: string | undefined) => {
        if (!toDate) return { message: constants.toDate.messages.required }
        else if (!validateDate(toDate)) return { message: constants.toDate.messages.invalid }
        else if (searchFormItem.value.fromDate && searchFormItem.value.fromDate > toDate)
          return { message: constants.toDate.messages.beforeFromDate }
      },
    },
  ],
  onSubmit: (item: FromDateToDate) => {
    const from = item.fromDate?.replace(/\//g, '-')
    const to = item.toDate?.replace(/\//g, '-')
    return { from, to }
  },
})
</script>
