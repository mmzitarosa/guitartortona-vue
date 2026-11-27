<template>
  <Card class="min-w-0">
    <template #title>{{ t('customers.title') }}</template>
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="customers"
        :loading
        :globalFilterFields="['fullName', 'address', 'city', 'documentNumber', 'taxCode']"
        paginator
        :rows="15"
        :rowsPerPageOptions="[15, 30, 50]"
        rowHover
        dataKey="id"
        tableStyle="table-layout: fixed"
        :rowClass="() => 'cursor-pointer'"
        @row-click="onRowClick"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <Button
              :label="t('customers.clearFilters')"
              icon="pi pi-filter-slash"
              :disabled="!filters.global.value && !archived"
              severity="secondary"
              variant="text"
              @click="clearFilters"
            />
            <div class="flex flex-wrap items-center gap-4">
              <Button
                v-if="totalArchived > 0 || archived"
                :label="'Eliminate (' + totalArchived + ')'"
                icon="pi pi-trash"
                severity="secondary"
                :variant="archived ? undefined : 'text'"
                @click="setArchived(!archived)"
              />
              <IconField class="grow sm:grow-0 sm:w-80">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="filters.global.value"
                  :placeholder="t('customers.search')"
                  class="w-full"
                />
              </IconField>
            </div>
          </div>
        </template>
        <template #empty>{{ t('customers.empty') }}</template>
        <template #loading>{{ t('customers.loading') }}</template>

        <Column field="fullName" class="w-1/4" :header="t('customers.columns.name')" />
        <Column class="w-1/2" :header="t('customers.columns.address')">
          <template #body="{ data }">
            {{ data.address }}, {{ data.zipCode }} {{ data.city }} ({{ data.province }})
          </template>
        </Column>
        <Column class="w-1/4" :header="t('customers.columns.document')">
          <template #body="{ data }">
            <div v-if="data.documentType || data.documentNumber">
              {{ [data.documentType, data.documentNumber].filter(Boolean).join(' ') }}
            </div>
            <div v-if="data.taxCode" class="text-sm text-gray-500">{{ data.taxCode }}</div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <CustomerDialog
    v-model:visible="dialogVisible"
    :customer="editing"
    registry
    :archived
    @save="onSave"
    @archive="editing && onArchive(editing)"
    @restore="editing && onRestore(editing)"
    @hardDelete="editing && onHardDelete(editing)"
  />
  <ChangesDialog :changes="changes" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button, Card, Column, DataTable, IconField, InputIcon, InputText } from 'primevue'
import type { DataTableRowClickEvent } from 'primevue'
import { FilterMatchMode } from '@primevue/core/api'
import CustomerDialog from '@/components/forms/usedreceipt/CustomerDialog.vue'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import {
  archiveCustomer,
  deleteCustomer,
  getAllCustomers,
  getArchivedCustomers,
  putCustomer,
  restoreCustomer,
} from '@/services/api/customerService'
import { type Customer, withFullName } from '@/types/customer'
import { useConfirmDialogConstants, useUsedReceiptConstants } from '@/utils/i18nConstants'
import { useErrorHandler } from '@/utils/errorHandler'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const confirmDialog = useConfirmDialog()
const dialogs = useConfirmDialogConstants()
const { customerDialog: customerLabels } = useUsedReceiptConstants()
const { handleApiError } = useErrorHandler()

// Come nelle altre liste, la vista degli eliminati è nell'URL
const archived = computed(() => route.query.archived === 'true')
const loading = ref(false)
const active = ref<Customer[]>([])
const archivedList = ref<Customer[]>([])
const customers = computed(() =>
  (archived.value ? archivedList.value : active.value).map(withFullName),
)
const totalArchived = computed(() => archivedList.value.length)
const filters = ref({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
})

const dialogVisible = ref(false)
const editing = ref<Customer>()

const load = async () => {
  loading.value = true
  try {
    ;[active.value, archivedList.value] = await Promise.all([
      getAllCustomers(),
      getArchivedCustomers(),
    ])
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const setArchived = (value: boolean) =>
  router.replace({ query: { ...route.query, archived: value ? 'true' : undefined } })

const clearFilters = () => {
  filters.value.global.value = null
  setArchived(false)
}

const onRowClick = (event: DataTableRowClickEvent) => {
  editing.value = event.data
  dialogVisible.value = true
}

const changes = ref<{ field: string; oldValue: unknown; newValue: unknown; ignore: boolean }[]>([])

const onSave = async (customer: Customer) => {
  const before = editing.value as Record<string, unknown>
  changes.value = Object.entries(customerLabels.fields)
    .filter(([key]) => (before[key] ?? '') !== ((customer as Record<string, unknown>)[key] ?? ''))
    .map(([key, field]) => ({
      field,
      oldValue: before[key],
      newValue: (customer as Record<string, unknown>)[key] || '-',
      ignore: false,
    }))
  try {
    const saved = await confirmDialog.require({
      header: dialogs.updateDialog.title,
      message: dialogs.updateDialog.message,
      group: 'differences',
      icon: dialogs.updateDialog.icon,
      acceptLabel: dialogs.updateDialog.acceptLabel,
      toastSummary: dialogs.updateDialog.toastTitle,
      toastDetail: dialogs.updateDialog.toastMessage,
      accept: async () => {
        await putCustomer(customer.id as number, customer)
        return true
      },
    })
    if (saved) {
      dialogVisible.value = false
      await load()
    }
  } catch {
    await load()
  }
}

// Gli errori dell'azione confermata sono già mostrati da useConfirmDialog
const run = async (params: Parameters<typeof confirmDialog.require>[0]) => {
  try {
    if (!(await confirmDialog.require(params))) return
  } catch {
    // l'elenco viene comunque ricaricato
  }
  dialogVisible.value = false
  await load()
}

const onArchive = (customer: Customer) =>
  run({
    header: dialogs.archiveDialog.title,
    message: t('customers.archiveMessage'),
    icon: dialogs.archiveDialog.icon,
    acceptLabel: dialogs.archiveDialog.acceptLabel,
    acceptSeverity: 'contrast',
    toastSummary: dialogs.archiveDialog.toastTitle,
    toastDetail: dialogs.archiveDialog.toastMessage,
    accept: async () => {
      await archiveCustomer(customer.id as number)
      return true
    },
  })

const onRestore = (customer: Customer) =>
  run({
    header: dialogs.restoreDialog.title,
    message: dialogs.restoreDialog.message,
    icon: dialogs.restoreDialog.icon,
    acceptLabel: dialogs.restoreDialog.acceptLabel,
    toastSummary: dialogs.restoreDialog.toastTitle,
    toastDetail: dialogs.restoreDialog.toastMessage,
    accept: async () => {
      await restoreCustomer(customer.id as number)
      return true
    },
  })

// Doppia conferma: l'eliminazione fisica è irreversibile
const onHardDelete = async (customer: Customer) => {
  const proceed = await confirmDialog.require<boolean>({
    header: dialogs.hardDeleteDialog.title,
    message: t('customers.hardDeleteMessage'),
    icon: dialogs.hardDeleteDialog.icon,
    acceptLabel: dialogs.hardDeleteDialog.firstAcceptLabel,
    acceptSeverity: 'contrast',
    accept: async () => true,
  })
  if (!proceed) return
  await run({
    header: dialogs.hardDeleteDialog.title,
    message: dialogs.hardDeleteDialog.confirmMessage,
    icon: dialogs.hardDeleteDialog.icon,
    acceptLabel: dialogs.hardDeleteDialog.acceptLabel,
    acceptSeverity: 'contrast',
    toastSummary: dialogs.hardDeleteDialog.toastTitle,
    toastDetail: dialogs.hardDeleteDialog.toastMessage,
    accept: async () => {
      await deleteCustomer(customer.id as number)
      return true
    },
  })
}

onMounted(load)
</script>
