<template>
  <Card class="min-w-0">
    <template #title>{{ t('audit.title') }}</template>
    <template #content>
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div class="flex flex-wrap items-center gap-4">
          <InputTextField
            v-model="form.username"
            inputId="audit-user"
            :label="t('audit.filters.user')"
            class="w-48"
          />
          <SelectField
            v-model="form.entityType"
            inputId="audit-entity"
            :options="entityOptions"
            optionValue="value"
            optionLabel="label"
            showClear
            :label="t('audit.filters.entity')"
            class="w-56"
          />
          <InputDateField
            v-model="form.from"
            inputId="audit-from"
            :label="t('audit.filters.from')"
            clearable
          />
          <InputDateField
            v-model="form.to"
            inputId="audit-to"
            :label="t('audit.filters.to')"
            clearable
          />
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <Button
            v-if="hasFilters"
            label="Rimuovi filtri"
            icon="pi pi-filter-slash"
            severity="secondary"
            variant="text"
            @click="onReset"
          />
          <SelectField
            v-model="form.operation"
            inputId="audit-operation"
            :options="operationOptions"
            optionValue="value"
            optionLabel="label"
            showClear
            :label="t('audit.filters.operation')"
            :optionSeverity="(option) => severity(option.value)"
            class="w-56"
          />
        </div>
      </div>

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
        tableStyle="table-layout: fixed"
        dataKey="id"
        selectionMode="single"
        @page="onPage"
        @rowSelect="(e: { data: AuditLog }) => (selected = e.data)"
      >
        <template #empty>{{ t('audit.empty') }}</template>
        <Column field="date" class="w-[11%]" bodyClass="truncate" :header="t('audit.columns.date')">
          <template #body="{ data }">{{ formatDateTime(data.date) }}</template>
        </Column>
        <Column
          field="username"
          class="w-[11%]"
          bodyClass="truncate"
          :header="t('audit.columns.user')"
        />
        <Column class="w-[16%]" bodyClass="truncate" :header="t('audit.columns.entity')">
          <template #body="{ data }">
            <RouterLink
              v-if="entityRoute(data)"
              :to="entityRoute(data)!"
              class="text-primary hover:underline"
              @click.stop
            >
              {{ entityLabel(data.entityType) }} #{{ data.entityId }}
            </RouterLink>
            <template v-else>{{ entityLabel(data.entityType) }} #{{ data.entityId }}</template>
          </template>
        </Column>
        <Column class="w-[18%]" bodyClass="truncate" :header="t('audit.columns.operation')">
          <template #body="{ data }">
            <Tag
              :value="t(`audit.operations.${data.operation}`)"
              :severity="severity(data.operation)"
            />
          </template>
        </Column>
        <Column class="w-[12%]" bodyClass="truncate" :header="t('audit.columns.field')">
          <template #body="{ data }">{{ data.field ? fieldLabel(data.field) : '' }}</template>
        </Column>
        <Column class="w-[16%]" bodyClass="truncate" :header="t('audit.columns.oldValue')">
          <template #body="{ data }">
            <span class="block truncate">{{ data.field ? data.oldValue : '' }}</span>
          </template>
        </Column>
        <Column class="w-[16%]" bodyClass="truncate" :header="t('audit.columns.newValue')">
          <template #body="{ data }">
            <span class="block truncate">{{ data.field ? data.newValue : '' }}</span>
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
      <dd>
        <RouterLink
          v-if="entityRoute(selected)"
          :to="entityRoute(selected)!"
          class="text-primary hover:underline"
        >
          {{ entityLabel(selected.entityType) }} #{{ selected.entityId }}
        </RouterLink>
        <template v-else>{{ entityLabel(selected.entityType) }} #{{ selected.entityId }}</template>
      </dd>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, Column, DataTable, Dialog, Tag } from 'primevue'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import SelectField from '@/components/layout/fields/SelectField.vue'
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
  'Customer',
  'Brand',
  'Category',
]
const OPERATIONS = ['CREATE', 'UPDATE', 'DELETE', 'ALIGN', 'IGNORE']

const entityOptions = computed(() => ENTITIES.map((e) => ({ value: e, label: entityLabel(e) })))
const operationOptions = computed(() =>
  OPERATIONS.map((o) => ({ value: o, label: t(`audit.operations.${o}`) })),
)

const emptyForm = () => ({
  username: undefined as string | undefined,
  entityType: undefined as string | undefined,
  operation: undefined as string | undefined,
  from: undefined as Date | undefined,
  to: undefined as Date | undefined,
})
const form = reactive(emptyForm())
const hasFilters = computed(() => Object.values(form).some((value) => !!value))

const rows = ref<AuditLog[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(15)
const loading = ref(false)
const selected = ref<AuditLog | null>(null)

const entityLabel = (type: string) =>
  te(`audit.entities.${type}`) ? t(`audit.entities.${type}`) : type
// Pagina di dettaglio dell'entità; l'eliminazione definitiva non ha più un documento da aprire
const ENTITY_ROUTES: Record<string, string> = {
  Product: 'product',
  IncomingInvoice: 'incomingInvoice',
  UsedReceipt: 'usedReceipt',
  LedgerEntry: 'ledgerEntry',
}
const entityRoute = (log: AuditLog) => {
  const name = ENTITY_ROUTES[log.entityType]
  return name && log.operation !== 'DELETE'
    ? { name, params: { id: log.entityId }, query: { editable: 'false' } }
    : null
}
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
      username: form.username?.trim() || undefined,
      entityType: form.entityType,
      operation: form.operation,
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

const onReset = () => Object.assign(form, emptyForm())

// Ricerca automatica al variare dei filtri (con attesa mentre si digita l'utente)
let timer: ReturnType<typeof setTimeout> | undefined
watch(form, () => {
  clearTimeout(timer)
  timer = setTimeout(onSearch, 300)
})

const onPage = (event: { page: number; rows: number }) => {
  page.value = event.page
  size.value = event.rows
  load()
}

onMounted(load)
</script>
