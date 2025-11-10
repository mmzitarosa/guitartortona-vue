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
          <Button v-if="hasChanges" type="button" icon="pi pi-print" severity="secondary" @click="printTable" />
          <Button v-if="hasChanges" type="button" icon="pi pi-times" severity="secondary" @click="resetForm" />
          <Button type="submit" icon="pi pi-search" />
        </div>
      </Form>

      <DataTable v-model:selection="selectedLedgerEntry" :value="ledger" paginator @page="onPage"
                 :rows="filter.size" :first="filter.first" :totalRecords lazy tableStyle="min-width: 50rem" stripedRows
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
import { computed, onMounted, type Ref, ref, watch } from 'vue'
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
  filter: {
    page: number,
    size: number,
    first: number,
    from?: string,
    to?: string
  }
}>()

const fromDate : Ref<string | undefined> = ref(props.filter.from)
const toDate : Ref<string | undefined> = ref(props.filter.to)
const emit = defineEmits(['search', 'page', 'rowSelect', 'reset'])

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  loadLedger(props.filter.from, props.filter.to, props.filter.page, props.filter.size, undefined)
})

// La logica di load è stata messa nel watch per effettuare la chiamata anche a seguito del click su
// sidebar. Mettendo il listener sulle proprietà, è stato rimosso il load dall'onPage e onFormSubmit
watch(() => props.filter, (value) => {
  loadLedger(value.from, value.to, value.page, value.size, undefined)
})

const onRowSelect = (): void => {
  emit('rowSelect', selectedLedgerEntry.value?.id)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows

  emit('page', page, rows)
}

// DateForm
const onFormSubmit = (event: FormSubmitEvent) => {
//  if (!event.valid) return
  const from = fromDate.value?.replace(/\//g, '-')
  const to = toDate.value?.replace(/\//g, '-')
  emit('search', from, to)
}

const resetForm = () => {
  fromDate.value = undefined
  toDate.value = undefined
  emit('reset')
}

const hasChanges = computed(() => {
  return props.filter.from &&  props.filter.to
})

import {
print
} from '@/services/api/ledgerService.ts'

const printTable = () => {
  if (props.filter.from && props.filter.to) print(props.filter.from, props.filter.to)
}

</script>
