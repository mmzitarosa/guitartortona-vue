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
        <Column field="supplier.name" header="Fornitore"></Column>
        <Column field="date" header="Data Fattura"></Column>
        <Column field="number" header="Numero Fattura"></Column>
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
        <Column header="Stato" class="w-24">
          <template #body="{ data }">
            <Tag v-if="data.status && data.status!=='COMPLETED'" :value="constants.draft.label"
                 :severity="constants.draft.severity" />
          </template>
        </Column>
        <Column class="w-0 !text-end">
          <template #body="{ data }">
            <span class="flex">
            <Button type="button" icon="pi pi-eye" @click="onRowSelect(data, false)"
                    severity="primary" text rounded></Button>
            <Button type="button" icon="pi pi-pencil" @click="onRowSelect(data, true)"
                    severity="primary" text rounded></Button>
            </span>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Column, DataTable, type DataTablePageEvent, Tag, Button } from 'primevue'
import { onMounted, watch } from 'vue'
import { useIncomingInvoicesTable } from '@/composables/useIncomingInvoicesTable.ts'
import { useIncomingInvoicesTableConstants } from '@/utils/i18nConstants.ts'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'

const constants = useIncomingInvoicesTableConstants()

const { incomingInvoices, totalRecords, loadIncomingInvoices, loading } = useIncomingInvoicesTable()

const props = defineProps<{
  filter: {
    page: number
    size: number
    first: number
  }
}>()

const emit = defineEmits(['page', 'rowSelect'])

// Carica la tabella al primo caricamento della pagina
onMounted(() => {
  const { page, size } = props.filter
  reload(page, size)
})

// La logica di load è stata messa nel watch per effettuare la chiamata anche a seguito del click su
// sidebar. Mettendo il listener sulle proprietà, è stato rimosso il load dall'onPage e onFormSubmit
watch(
  () => props.filter,
  (value) => {
    reload(value.page, value.size)
  }
)

const reload = (page?: number, size?: number) => {
  loadIncomingInvoices(page, size, undefined)
}

const onRowSelect = (data: IncomingInvoice, edit: boolean): void => {
  emit('rowSelect', data.id, edit)
}

const onPage = async (event: DataTablePageEvent) => {
  const rows = event.rows
  const page = event.first / rows

  emit('page', page, rows)
}

</script>
