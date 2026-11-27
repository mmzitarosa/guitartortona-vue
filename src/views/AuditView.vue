<template>
  <Card class="min-w-0">
    <template #title>{{ t('audit.title') }}</template>
    <template #content>
      <form class="flex flex-wrap items-end gap-3 mb-4" @submit.prevent="onSearch">
        <div class="flex flex-col gap-1 grow sm:grow-0">
          <label for="audit-user" class="text-sm">{{ t('audit.filters.user') }}</label>
          <InputText id="audit-user" v-model="form.username" />
        </div>
        <div class="flex flex-col gap-1 grow sm:grow-0">
          <label for="audit-entity" class="text-sm">{{ t('audit.filters.entity') }}</label>
          <Select
            inputId="audit-entity"
            v-model="form.entityType"
            :options="entityOptions"
            optionLabel="label"
            optionValue="value"
            showClear
            :placeholder="t('audit.filters.all')"
          />
        </div>
        <div class="flex flex-col gap-1 grow sm:grow-0">
          <label for="audit-operation" class="text-sm">{{ t('audit.filters.operation') }}</label>
          <Select
            inputId="audit-operation"
            v-model="form.operation"
            :options="operationOptions"
            optionLabel="label"
            optionValue="value"
            showClear
            :placeholder="t('audit.filters.all')"
          />
        </div>
        <div class="flex flex-col gap-1 grow sm:grow-0">
          <label for="audit-from" class="text-sm">{{ t('audit.filters.from') }}</label>
          <DatePicker inputId="audit-from" v-model="form.from" dateFormat="dd/mm/yy" showIcon />
        </div>
        <div class="flex flex-col gap-1 grow sm:grow-0">
          <label for="audit-to" class="text-sm">{{ t('audit.filters.to') }}</label>
          <DatePicker inputId="audit-to" v-model="form.to" dateFormat="dd/mm/yy" showIcon />
        </div>
        <div class="flex gap-2">
          <Button type="submit" icon="pi pi-search" :aria-label="t('audit.filters.user')" />
          <Button
            type="button"
            icon="pi pi-filter-slash"
            severity="secondary"
            :label="t('audit.filters.reset')"
            @click="onReset"
          />
        </div>
      </form>

      <DataTable
        :value="rows"
        lazy
        paginator
        :rows="size"
        :first="page * size"
        :totalRecords="total"
        :rowsPerPageOptions="[15, 30, 50]"
        :loading
        rowHover
        scrollable
        dataKey="id"
        selectionMode="single"
        @page="onPage"
        @rowSelect="(e: { data: AuditLog }) => (selected = e.data)"
      >
        <template #empty>{{ t('audit.empty') }}</template>
        <Column field="date" :header="t('audit.columns.date')">
          <template #body="{ data }">{{ formatDateTime(data.date) }}</template>
        </Column>
        <Column field="username" :header="t('audit.columns.user')" />
        <Column :header="t('audit.columns.entity')">
          <template #body="{ data }">
            {{ entityLabel(data.entityType) }} #{{ data.entityId }}
          </template>
        </Column>
        <Column :header="t('audit.columns.operation')">
          <template #body="{ data }">
            <Tag
              :value="t(`audit.operations.${data.operation}`)"
              :severity="severity(data.operation)"
            />
          </template>
        </Column>
        <Column :header="t('audit.columns.field')">
          <template #body="{ data }">{{ data.field ? fieldLabel(data.field) : '' }}</template>
        </Column>
        <Column :header="t('audit.columns.oldValue')">
          <template #body="{ data }">
            <span class="block max-w-60 truncate">{{ data.field ? data.oldValue : '' }}</span>
          </template>
        </Column>
        <Column :header="t('audit.columns.newValue')">
          <template #body="{ data }">
            <span class="block max-w-60 truncate">{{ data.field ? data.newValue : '' }}</span>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <Dialog
    :visible="!!selected"
    modal
    :header="t('audit.detail')"
    class="w-[95vw] max-w-2xl"
    @update:visible="selected = null"
  >
    <dl v-if="selected" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      <dt class="text-muted-color">{{ t('audit.columns.date') }}</dt>
      <dd>{{ formatDateTime(selected.date) }}</dd>
      <dt class="text-muted-color">{{ t('audit.columns.user') }}</dt>
      <dd>{{ selected.username }}</dd>
      <dt class="text-muted-color">{{ t('audit.columns.entity') }}</dt>
      <dd>{{ entityLabel(selected.entityType) }} #{{ selected.entityId }}</dd>
      <dt class="text-muted-color">{{ t('audit.columns.operation') }}</dt>
      <dd>{{ t(`audit.operations.${selected.operation}`) }}</dd>
      <template v-if="selected.field">
        <dt class="text-muted-color">{{ t('audit.columns.field') }}</dt>
        <dd>{{ fieldLabel(selected.field) }}</dd>
      </template>
      <dt class="text-muted-color">{{ t('audit.columns.oldValue') }}</dt>
      <dd class="whitespace-pre-wrap break-words min-w-0">{{ pretty(selected.oldValue) }}</dd>
      <dt class="text-muted-color">{{ t('audit.columns.newValue') }}</dt>
      <dd class="whitespace-pre-wrap break-words min-w-0">{{ pretty(selected.newValue) }}</dd>
    </dl>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Card,
  Column,
  DataTable,
  DatePicker,
  Dialog,
  InputText,
  Select,
  Tag,
} from 'primevue'
import { getAuditLog } from '@/services/api/auditService'
import { useErrorHandler } from '@/utils/errorHandler'
import { formatDate } from '@/utils/dateUtils'
import type { AuditLog } from '@/types/audit'

const { t, te } = useI18n()
const { handleApiError } = useErrorHandler()

const ENTITIES = [
  'Product',
  'Sale',
  'IncomingInvoice',
  'UsedReceipt',
  'PurchaseItem',
  'LedgerEntry',
  'Supplier',
  'Brand',
  'Category',
]
const OPERATIONS = ['CREATE', 'UPDATE', 'DELETE', 'ALIGN', 'IGNORE']

const entityOptions = computed(() => ENTITIES.map((e) => ({ value: e, label: entityLabel(e) })))
const operationOptions = computed(() =>
  OPERATIONS.map((o) => ({ value: o, label: t(`audit.operations.${o}`) })),
)

const emptyForm = () => ({
  username: '',
  entityType: null as string | null,
  operation: null as string | null,
  from: null as Date | null,
  to: null as Date | null,
})
const form = reactive(emptyForm())

const rows = ref<AuditLog[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(15)
const loading = ref(false)
const selected = ref<AuditLog | null>(null)

const entityLabel = (type: string) =>
  te(`audit.entities.${type}`) ? t(`audit.entities.${type}`) : type
const fieldLabel = (field: string) =>
  te(`audit.fields.${field}`) ? t(`audit.fields.${field}`) : field
const SEVERITIES: Record<string, string> = {
  CREATE: 'success',
  DELETE: 'danger',
  ALIGN: 'warn',
  IGNORE: 'secondary',
}
const severity = (op: string) => SEVERITIES[op] ?? 'info'

const formatDateTime = (value: string) => {
  const d = new Date(value)
  return `${formatDate(d)} ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
}

// Le istantanee di creazione/eliminazione sono JSON: le mostro indentate
const pretty = (value?: string) => {
  if (!value) return '-'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const load = async () => {
  loading.value = true
  try {
    const result = await getAuditLog({
      username: form.username.trim() || undefined,
      entityType: form.entityType ?? undefined,
      operation: form.operation ?? undefined,
      from: formatDate(form.from ?? undefined, '-')
        ?.split('-')
        .reverse()
        .join('-'),
      to: formatDate(form.to ?? undefined, '-')
        ?.split('-')
        .reverse()
        .join('-'),
      page: page.value,
      size: size.value,
    })
    rows.value = result.content
    total.value = result.totalElements
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  page.value = 0
  load()
}

const onReset = () => {
  Object.assign(form, emptyForm())
  onSearch()
}

const onPage = (event: { page: number; rows: number }) => {
  page.value = event.page
  size.value = event.rows
  load()
}

onMounted(load)
</script>
