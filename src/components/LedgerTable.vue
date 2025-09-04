<template>
  <Card>
    <template #content>
      <Form @submit="onFormSubmit">
        <div class="flex gap-4 pb-4 justify-end">

          <FormField v-slot="$field" name="fromDate">
            <FloatLabel variant="on">
              <InputMask id="fromDate" v-model="fromDate" mask="99/99/9999" class="p-filled"
                         placeholder="gg/mm/aaaa" :autoClear="false" />

              <label for="fromDate">Filtra da</label>
            </FloatLabel>
            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                $field.error?.message
              }}
            </Message>
          </FormField>
          <FormField v-slot="$field" name="toDate">
            <FloatLabel variant="on">
              <InputMask id="toDate" v-model="toDate" mask="99/99/9999" class="p-filled"
                         placeholder="gg/mm/aaaa" :autoClear="false" />

              <label for="toDate">Filtra a</label>
            </FloatLabel>
            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                $field.error?.message
              }}
            </Message>
          </FormField>

          <Button type="button" icon="pi pi-print" severity="secondary" />

          <Button type="submit" icon="pi pi-search"
          />
        </div>
      </Form>

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
  </Card>

</template>

<script setup lang="ts">

import {
  Button,
  Card,
  Column,
  DataTable,
  type DataTablePageEvent,
  FloatLabel,
  InputMask,
  Message
} from 'primevue'
import { onMounted, type Ref, ref } from 'vue'
import { movementTypesMap, paymentMethodsMap, paymentTypesMap } from '@/types/ledgerEntry.ts'
import { useLedgerTable } from '@/composables/useLedgerTable.ts'
import { Form, FormField, type FormSubmitEvent } from '@primevue/forms'

const {
  ledger,
  selectedLedgerEntry,
  totalRecords,
  loadLedger,
  loading
} = useLedgerTable()

const props = defineProps<{
  page: number,
  rows: number,
  first: number,
  dateFilter?: {
    from: string,
    to: string
  }
}>()

const fromDate : Ref<string | undefined> = ref(props.dateFilter?.from)
const toDate : Ref<string | undefined> = ref(props.dateFilter?.to)

const emit = defineEmits(['search', 'page', 'rowSelect'])

onMounted(() => {
  loadLedger(fromDate.value, toDate.value, props.page, props.rows, undefined)
})

const onRowSelect = (): void => {
  emit('rowSelect', selectedLedgerEntry.value?.id)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows

  emit('page', page, rows)
  loadLedger(props.dateFilter?.from, props.dateFilter?.to, page, rows, undefined)
}

// DateForm
const onFormSubmit = (event: FormSubmitEvent) => {
//  if (!event.valid) return
  const from = fromDate.value?.replace(/\//g, '-')
  const to = toDate.value?.replace(/\//g, '-')
  loadLedger(from, to)
  emit('search', from, to)
}

const resetForm = () => {
//  if (filter.value !== undefined) filter.value = undefined
//  fromDate.value = undefined
//  toDate.value = undefined
}

//Se tolgo i filtri non ricarica, ad esempio cliccando su Brogliaccio dal menu

</script>
