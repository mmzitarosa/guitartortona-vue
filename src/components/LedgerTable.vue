<template>
  <DataTable v-model:selection="selectedLedgerEntry" :value="ledger" paginator @page="onPage"
             :rows :first :totalRecords lazy tableStyle="min-width: 50rem" stripedRows
             scrollable scroll-height="flex" selectionMode="single" dataKey="id"
             @rowSelect="onRowSelect" :loading rowHover>
    <Column field="date" header="Data"></Column>
    <Column field="invoiceNumber" header="NumeroF"></Column>
    <Column field="invoiceDate" header="DataF"></Column>
    <Column field="description" header="Descrizione"></Column>
    <Column field="reason" header="Causale"></Column>
    <Column field="bank.name" header="Banca"></Column>
    <Column header="S/A" bodyStyle="text-align:center">
      <template #body="slotProps">
        {{ slotProps.data.paymentType ? paymentTypesMap[slotProps.data.paymentType].char : undefined
        }}
      </template>
    </Column>
    <Column field="receiptNumber" header="Ultime3" bodyStyle="text-align:center"></Column>
    <Column header="Importo" bodyStyle="text-align:right">
      <template #body="{ data}">
        <p v-if="data.amount && data.movementType"
           :class="movementTypesMap[data.movementType].style">
          {{ movementTypesMap[data.movementType].char + data.amount.toLocaleString('it-IT', {
          style: 'currency',
          currency: 'EUR'
        }) }}
        </p>
      </template>
    </Column>
    <Column class="pl-0!">
      <template #body=" {data}">
        <i v-if="data.paymentMethod" :class="paymentMethodsMap[data.paymentMethod].icon"></i>
      </template>
    </Column>
  </DataTable>

</template>

<script setup lang="ts">

import { Column, DataTable, type DataTablePageEvent } from 'primevue'
import { onMounted, ref } from 'vue'
import { movementTypesMap, paymentMethodsMap, paymentTypesMap } from '@/types/ledgerEntry.ts'
import { useLedgerTable } from '@/composables/useLedgerTable.ts'

const {
  ledger,
  selectedLedgerEntry,
  totalRecords,
  loadLedger,
  loading
} = useLedgerTable()

const props = defineProps({
  page: {
    type: Number,
    default: 0
  },
  rows: {
    type: Number,
    default: 15
  }
})

const first = ref(props.page * props.rows)

const emit = defineEmits(['page', 'rowSelect'])

onMounted(() => {
  loadLedger(props.page, props.rows, undefined)
})

const onRowSelect = (): void => {
  emit('rowSelect', selectedLedgerEntry.value?.id)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows

  emit('page', page, rows)
  loadLedger(page, rows, undefined)
}

</script>
