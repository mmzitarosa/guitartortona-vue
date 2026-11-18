<template>
  <section>
    <div class="flex items-center justify-end flex-wrap gap-2 mb-2">
      <div v-if="events.length" class="flex items-center gap-2 text-xs">
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
          {{ t('fieldset.history.totalPurchased') }} {{ totals.purchased }}
        </span>
        <span class="px-2 py-1 rounded-full bg-primary/10 text-primary">
          {{ t('fieldset.history.totalSold') }} {{ totals.sold }}
        </span>
      </div>
    </div>

    <p v-if="!loading && !events.length" class="text-sm text-muted-color">
      {{ t('fieldset.history.empty') }}
    </p>

    <ol
      class="relative border-s-2 border-surface-200 dark:border-surface-700 ms-3 list-none p-0 m-0"
    >
      <li
        v-for="(event, index) in events"
        :key="index"
        v-tooltip.left="event.notes ? { value: event.notes, class: 'max-w-80' } : undefined"
        class="relative ms-6 mb-3 last:mb-0 px-3 py-2 rounded-lg transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
        :class="{ 'cursor-help': event.notes }"
      >
        <span
          class="absolute -start-[2.35rem] top-3 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-surface-100 dark:ring-surface-900 text-white"
          :class="event.type === 'SALE' ? 'bg-primary' : 'bg-surface-600 dark:bg-surface-400'"
        >
          <i
            :class="event.type === 'SALE' ? 'pi pi-shopping-cart' : 'pi pi-download'"
            class="text-xs"
          />
        </span>

        <div class="flex items-baseline justify-between gap-2">
          <span class="font-medium">
            {{
              event.type === 'SALE' ? t('fieldset.history.sale') : t('fieldset.history.purchase')
            }}
            <span
              class="ms-1 text-sm font-medium"
              :class="
                event.type === 'SALE'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-blue-600 dark:text-blue-400'
              "
            >
              {{ event.type === 'SALE' ? '−' : '+' }}{{ event.quantity }}
            </span>
          </span>
          <span
            v-if="isCost(event) && !revealed"
            class="font-medium tracking-widest text-surface-400"
            >••••</span
          >
          <span v-else class="font-medium tabular-nums">{{ total(event) }}</span>
        </div>

        <div class="text-xs text-muted-color flex items-center gap-2 flex-wrap">
          <span>{{ event.date }}</span>
          <span
            v-if="event.status && event.status !== 'COMPLETED'"
            class="px-1.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400"
          >
            {{ t('fieldset.history.draft') }}
          </span>
          <i v-if="event.notes" class="pi pi-comment" :aria-label="t('fieldset.history.notes')" />
        </div>

        <div v-if="event.type === 'PURCHASE'" class="text-sm mt-1">
          <RouterLink
            v-if="event.invoiceId"
            :to="{ path: `/incomingInvoice/${event.invoiceId}`, query: { editable: 'false' } }"
            class="text-primary hover:underline"
            @click.stop
          >
            {{ t('fieldset.history.invoice', { number: event.invoiceNumber ?? '-' }) }}
          </RouterLink>
          <span v-if="event.supplier" class="text-muted-color"> · {{ event.supplier }}</span>
        </div>

        <div v-if="event.price != null" class="text-xs text-muted-color mt-1">
          <template v-if="isCost(event) && !revealed">
            {{ t('fieldset.history.quantityOnly', { quantity: event.quantity }) }}
          </template>
          <template v-else>
            {{
              t('fieldset.history.unitPrice', {
                quantity: event.quantity,
                price: unit(event.price),
              })
            }}
            <template v-if="event.type === 'PURCHASE' && event.vat != null">
              · {{ t('fieldset.history.vat', { vat: event.vat }) }}
            </template>
          </template>
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
import { getProductHistory } from '@/services/api/productService'
import type { ProductEvent } from '@/types/productEvent'
import { formatCurrency } from '@/utils/currencyUtils'

const props = defineProps<{ productId?: number; refreshKey?: unknown }>()

const { t } = useI18n()
const events = ref<ProductEvent[]>([])
const loading = ref(false)

const { canSeeCosts } = useRoles()
const revealed = ref(false)
// Tutti gli importi (costi e prezzi di vendita) sono nascosti finché non si clicca sull'occhio
const isCost = (event: ProductEvent) => event.price != null
const hasCosts = computed(() => events.value.some(isCost))

const unit = (price?: number) => formatCurrency(price) ?? '-'

// Per gli acquisti il totale comprende l'IVA
const total = (event: ProductEvent) => {
  if (event.price == null || event.quantity == null) return '-'
  const vat = event.type === 'PURCHASE' ? 1 + (event.vat ?? 0) / 100 : 1
  return formatCurrency(event.price * event.quantity * vat)
}

const totals = computed(() => ({
  purchased: events.value
    .filter((e) => e.type === 'PURCHASE')
    .reduce((sum, e) => sum + (e.quantity ?? 0), 0),
  sold: events.value
    .filter((e) => e.type === 'SALE')
    .reduce((sum, e) => sum + (e.quantity ?? 0), 0),
}))

watch(
  () => [props.productId, props.refreshKey],
  async () => {
    if (!props.productId) return
    loading.value = true
    try {
      events.value = await getProductHistory(props.productId)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>
