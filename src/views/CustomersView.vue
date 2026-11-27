<template>
  <Card class="min-w-0">
    <template #title>{{ t('customers.title') }}</template>
    <template #content>
      <Message v-if="archived" severity="warn" icon="pi pi-trash" class="mb-4">
        {{ t('customers.archivedMessage') }}
      </Message>

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
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <IconField class="grow sm:grow-0 sm:w-80">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters.global.value"
                :placeholder="t('customers.search')"
                class="w-full"
              />
            </IconField>
            <Button
              :label="archived ? t('customers.showActive') : t('customers.showArchived')"
              :icon="archived ? 'pi pi-users' : 'pi pi-trash'"
              severity="secondary"
              variant="text"
              @click="toggleArchived"
            />
          </div>
        </template>
        <template #empty>{{ t('customers.empty') }}</template>
        <template #loading>{{ t('customers.loading') }}</template>

        <Column field="fullName" :header="t('customers.columns.name')" />
        <Column :header="t('customers.columns.address')">
          <template #body="{ data }">
            {{ data.address }}, {{ data.zipCode }} {{ data.city }} ({{ data.province }})
          </template>
        </Column>
        <Column :header="t('customers.columns.document')">
          <template #body="{ data }">
            <div v-if="data.documentType || data.documentNumber">
              {{ [data.documentType, data.documentNumber].filter(Boolean).join(' ') }}
            </div>
            <div v-if="data.taxCode" class="text-sm text-gray-500">{{ data.taxCode }}</div>
          </template>
        </Column>
        <Column :header="t('customers.columns.actions')">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-2">
              <template v-if="archived">
                <Button
                  :label="buttons.hardDelete.label"
                  :icon="buttons.hardDelete.icon"
                  severity="danger"
                  size="small"
                  @click="onHardDelete(data)"
                />
                <Button
                  :label="buttons.restore.label"
                  :icon="buttons.restore.icon"
                  severity="secondary"
                  size="small"
                  @click="onRestore(data)"
                />
              </template>
              <template v-else>
                <Button
                  :label="buttons.delete.label"
                  :icon="buttons.delete.icon"
                  severity="danger"
                  size="small"
                  @click="onArchive(data)"
                />
                <Button
                  :label="buttons.edit.label"
                  :icon="buttons.edit.icon"
                  size="small"
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
import { useI18n } from 'vue-i18n'
import {
  Button,
  Card,
  Column,
  DataTable,
  IconField,
  InputIcon,
  InputText,
  Message,
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

const archived = ref(false)
const loading = ref(false)
const list = ref<Customer[]>([])
const customers = computed(() => list.value.map(withFullName))
const filters = ref({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
})

const dialogVisible = ref(false)
const editing = ref<Customer>()

const load = async () => {
  loading.value = true
  try {
    list.value = await (archived.value ? getArchivedCustomers() : getAllCustomers())
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const toggleArchived = () => {
  archived.value = !archived.value
  load()
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
