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
                v-if="totalArchived > 0"
                :label="'Eliminate (' + totalArchived + ')'"
                icon="pi pi-trash"
                :disabled="archived"
                severity="secondary"
                variant="text"
                @click="setArchived(true)"
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
        <Column class="w-2/5" :header="t('customers.columns.address')">
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
        <Column class="w-28">
          <template #body="{ data }">
            <div class="flex justify-end gap-1">
              <template v-if="archived">
                <Button
                  v-tooltip.top="buttons.hardDelete.label"
                  :icon="buttons.hardDelete.icon"
                  :aria-label="buttons.hardDelete.label"
                  severity="secondary"
                  rounded
                  text
                  @click="onHardDelete(data)"
                />
                <Button
                  v-tooltip.top="buttons.restore.label"
                  :icon="buttons.restore.icon"
                  :aria-label="buttons.restore.label"
                  severity="secondary"
                  rounded
                  text
                  @click="onRestore(data)"
                />
              </template>
              <template v-else>
                <Button
                  v-tooltip.top="buttons.delete.label"
                  :icon="buttons.delete.icon"
                  :aria-label="buttons.delete.label"
                  severity="secondary"
                  rounded
                  text
                  @click="onArchive(data)"
                />
                <Button
                  v-tooltip.top="buttons.edit.label"
                  :icon="buttons.edit.icon"
                  :aria-label="buttons.edit.label"
                  severity="secondary"
                  rounded
                  text
                  @click="onEdit(data)"
                />
              </template>
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <CustomerDialog v-model:visible="dialogVisible" :customer="editing" @save="onSave" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Card,
  Column,
  DataTable,
  IconField,
  InputIcon,
  InputText,
  useToast,
} from 'primevue'
import { FilterMatchMode } from '@primevue/core/api'
import CustomerDialog from '@/components/forms/usedreceipt/CustomerDialog.vue'
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
import { useConfirmDialogConstants } from '@/utils/i18nConstants'
import { useErrorHandler } from '@/utils/errorHandler'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirmDialog = useConfirmDialog()
const dialogs = useConfirmDialogConstants()
const { handleApiError } = useErrorHandler()

const buttons = {
  delete: { label: t('buttons.delete.label'), icon: t('buttons.delete.icon') },
  restore: { label: t('buttons.restore.label'), icon: t('buttons.restore.icon') },
  hardDelete: { label: t('buttons.hardDelete.label'), icon: t('buttons.hardDelete.icon') },
  edit: { label: t('buttons.edit.label'), icon: t('buttons.edit.icon') },
}

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
    // Senza più eliminati non c'è nulla da mostrare in quella vista
    if (archived.value && !archivedList.value.length) setArchived(false)
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

const onEdit = (customer: Customer) => {
  editing.value = customer
  dialogVisible.value = true
}

const onSave = async (customer: Customer) => {
  try {
    await putCustomer(customer.id as number, customer)
    toast.add({ severity: 'success', summary: t('customers.updated'), life: 3000 })
    await load()
  } catch (error) {
    handleApiError(error)
  }
}

// Gli errori dell'azione confermata sono già mostrati da useConfirmDialog
const run = async (params: Parameters<typeof confirmDialog.require>[0]) => {
  try {
    if (await confirmDialog.require(params)) await load()
  } catch {
    await load()
  }
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
