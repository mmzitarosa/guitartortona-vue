<template>
  <section>
    <div class="flex items-center justify-end flex-wrap gap-2 mb-2">
      <div v-if="entries.length" class="flex items-center gap-2 text-xs">
        <Button
          v-if="canSeeCosts && hasCosts"
          type="button"
          rounded
          text
          size="small"
          severity="secondary"
          :icon="revealed ? 'pi pi-eye-slash' : 'pi pi-eye'"
          :aria-label="revealed ? t('fieldset.history.hideCosts') : t('fieldset.history.showCosts')"
          v-tooltip.top="
            revealed ? t('fieldset.history.hideCosts') : t('fieldset.history.showCosts')
          "
          @click="revealed = !revealed"
        />
        <span
          class="px-2 py-1 rounded-full bg-surface-500/15 text-surface-700 dark:text-surface-300"
        >
          {{ t('fieldset.history.totalPurchased') }} {{ timeline.purchased }}
        </span>
        <span class="px-2 py-1 rounded-full bg-primary/10 text-primary">
          {{ t('fieldset.history.totalSold') }} {{ timeline.sold }}
        </span>
      </div>
    </div>

    <p v-if="!loading && !entries.length" class="text-sm text-muted-color">
      {{ t('fieldset.history.empty') }}
    </p>

    <ol
      class="relative border-s-2 border-surface-200 dark:border-surface-700 ms-3 list-none p-0 m-0"
    >
      <li
        v-for="(entry, index) in entries"
        :key="index"
        class="relative ms-6 mb-3 last:mb-0 px-3 py-2 rounded-lg transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
      >
        <span
          class="absolute -start-[2.35rem] top-3 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-surface-100 dark:ring-surface-900 text-white"
          :class="style(entry).bg"
        >
          <i :class="style(entry).icon" class="text-xs" />
        </span>

        <div class="flex justify-between gap-2">
          <div class="min-w-0">
            <div
              v-tooltip.bottom="whenTooltip(entry)"
              class="w-fit"
              :class="{ 'cursor-help': entry.at }"
            >
              <span class="font-medium">{{ t(`fieldset.history.${style(entry).label}`) }}</span>
              <span
                v-if="entry.quantity != null && entry.type !== 'PRODUCT_CHANGE'"
                class="ms-1 text-sm font-medium"
                :class="[
                  entry.type === 'SALE' ? 'text-primary' : 'text-surface-600 dark:text-surface-300',
                  { 'line-through opacity-60': superseded(entry, 'quantity') },
                ]"
              >
                {{ entry.type === 'SALE' ? '−' : '+' }}{{ entry.quantity }}
              </span>
            </div>

            <div
              v-tooltip.bottom="entry.notes ? { value: entry.notes, class: 'max-w-80' } : undefined"
              class="text-xs text-muted-color flex items-center gap-2 flex-wrap w-fit"
              :class="{ 'cursor-help': entry.notes }"
            >
              <span>{{ formatDay(entry.date) }}</span>
              <span
                v-if="entry.status && entry.status !== 'COMPLETED'"
                class="px-1.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400"
              >
                {{ t('fieldset.history.draft') }}
              </span>
              <i
                v-if="entry.notes"
                class="pi pi-comment"
                :aria-label="t('fieldset.history.notes')"
              />
            </div>

            <div v-for="c in entry.changes" :key="c.field" class="text-sm break-words">
              <span class="text-muted-color me-1">{{ fieldLabel(c.field) }}:</span>
              <template v-if="c.oldValue">
                <span class="text-muted-color line-through">{{
                  fieldValue(c.field, c.oldValue)
                }}</span>
                →
              </template>
              <span>{{ fieldValue(c.field, c.newValue) }}</span>
            </div>

            <div v-if="hasInvoice(entry) && entry.receiptId" class="text-sm mt-1">
              <RouterLink
                :to="{ path: `/usedReceipt/${entry.receiptId}`, query: { editable: 'false' } }"
                class="text-primary hover:underline"
                @click.stop
              >
                {{ t('fieldset.history.receipt', { number: entry.receiptNumber ?? '-' }) }}
              </RouterLink>
            </div>
            <div v-else-if="hasInvoice(entry)" class="text-sm mt-1">
              <RouterLink
                v-if="entry.invoiceId"
                :to="{ path: `/incomingInvoice/${entry.invoiceId}`, query: { editable: 'false' } }"
                class="text-primary hover:underline"
                @click.stop
              >
                {{ t('fieldset.history.invoice', { number: entry.invoiceNumber ?? '-' }) }}
              </RouterLink>
              <span v-if="entry.supplier" class="text-muted-color"> · {{ entry.supplier }}</span>
            </div>
          </div>

          <div
            v-if="entry.price != null"
            class="flex flex-col items-end shrink-0"
            :class="{ invisible: !revealed }"
          >
            <span
              class="font-medium tabular-nums"
              :class="costClass(entry)"
              v-tooltip.bottom="costTooltip(entry)"
            >
              {{ gross(entry) }}
            </span>
            <span
              v-if="entry.vat != null"
              class="text-xs text-muted-color"
              :class="{ 'line-through': superseded(entry, 'vat') }"
            >
              {{ t('fieldset.history.vat', { vat: entry.vat }) }}
            </span>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from 'primevue'
import { useRoles } from '@/composables/useRoles'
import { getProductTimeline } from '@/services/api/productService'
import type { ProductTimeline, TimelineEntry } from '@/types/productTimeline'
import { formatCurrency } from '@/utils/currencyUtils'

const props = defineProps<{ productId?: number; refreshKey?: unknown }>()

const { t, te } = useI18n()
const { canSeeCosts, isAdmin } = useRoles()
const timeline = ref<ProductTimeline>({ purchased: 0, sold: 0, entries: [] })
const loading = ref(false)
// Costi e prezzi di vendita restano nascosti finché non si clicca sull'occhio
const revealed = ref(false)

const entries = computed(() => timeline.value.entries)
const hasCosts = computed(() => entries.value.some((e) => e.price != null))

const STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  SALE: { bg: 'bg-primary', icon: 'pi pi-shopping-cart', label: 'sale' },
  PURCHASE: { bg: 'bg-surface-600 dark:bg-surface-400', icon: 'pi pi-download', label: 'purchase' },
  PURCHASE_CHANGE: {
    bg: 'bg-surface-600 dark:bg-surface-400',
    icon: 'pi pi-file-edit',
    label: 'changedPurchase',
  },
  PRODUCT_CHANGE: { bg: 'bg-amber-500', icon: 'pi pi-pencil', label: 'changed' },
  PRODUCT_CREATED: { bg: 'bg-amber-500', icon: 'pi pi-plus', label: 'created' },
}
const style = (e: TimelineEntry) => STYLES[e.type]!

const hasInvoice = (e: TimelineEntry) => e.type === 'PURCHASE' || e.type === 'PURCHASE_CHANGE'
const superseded = (e: TimelineEntry, field: string) => !!e.superseded?.includes(field)
const isCostSuperseded = (e: TimelineEntry) =>
  superseded(e, 'purchasePrice') || superseded(e, 'vat')

// Le date arrivano come yyyy-MM-dd: niente conversione di fuso
const formatDay = (value: string) => value.split('-').reverse().join('/')

const rate = (v?: number) => (v == null ? '' : t('fieldset.history.vat', { vat: v }))
const net = (v?: number) => formatCurrency(v) ?? '-'
// Costo unitario IVA inclusa (le vendite sono già IVA inclusa)
const gross = (e: TimelineEntry) =>
  formatCurrency(e.price! * (e.type === 'SALE' ? 1 : 1 + (e.vat ?? 0) / 100)) ?? '-'

const costClass = (e: TimelineEntry) => {
  const struck = isCostSuperseded(e)
  const hasTip = e.type !== 'SALE' && e.vat != null
  return [
    { 'line-through opacity-60': struck },
    hasTip && !struck ? 'underline decoration-dotted underline-offset-4' : '',
    { 'cursor-help': hasTip },
  ]
}

// Imponibile e aliquota, con i valori precedenti se sono cambiati
const costTooltip = (e: TimelineEntry) => {
  if (e.type === 'SALE' || e.vat == null) return undefined
  const oldPrice = e.previousPrice != null ? `${net(e.previousPrice)} → ` : ''
  const oldVat = e.previousVat != null ? `${rate(e.previousVat)} → ` : ''
  return `${oldPrice}${net(e.price)} · ${oldVat}${rate(e.vat)}`
}

// Data, ora e (solo admin) utente
const whenTooltip = (e: TimelineEntry) => {
  if (!e.at) return undefined
  const d = new Date(e.at)
  const when = `${d.toLocaleDateString('it-IT')} ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
  return isAdmin && e.users ? `${when} · ${t('fieldset.history.by', { user: e.users })}` : when
}

const fieldLabel = (field: string) =>
  te(`audit.fields.${field}`) ? t(`audit.fields.${field}`) : field

const fieldValue = (field: string, value?: string) =>
  value == null
    ? t('fieldset.history.emptyValue')
    : field === 'price' && !isNaN(Number(value))
      ? (formatCurrency(Number(value)) ?? value)
      : value

watch(
  () => [props.productId, props.refreshKey],
  async () => {
    if (!props.productId) return
    loading.value = true
    try {
      timeline.value = await getProductTimeline(props.productId)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>
