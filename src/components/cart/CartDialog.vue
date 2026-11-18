<template>
  <OverlayBadge
    v-if="canEdit && count > 0"
    :value="count"
    severity="danger"
    class="!fixed bottom-24 right-6 z-40"
  >
    <Button
      type="button"
      rounded
      size="large"
      severity="secondary"
      icon="pi pi-shopping-bag"
      :aria-label="t('cart.title')"
      v-tooltip.left="t('cart.title')"
      class="!w-14 !h-14 shadow-lg"
      @click="open"
    />
  </OverlayBadge>

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('cart.title')"
    class="w-[40rem] max-w-[95vw]"
    :pt="{ pcCloseButton: { root: { class: '!outline-none' } } }"
  >
    <div class="flex flex-col gap-4 pt-1">
      <p v-if="!items.length" class="text-muted-color">{{ t('cart.empty') }}</p>

      <ul
        v-else
        class="list-none p-0 m-0 flex flex-col divide-y divide-surface-200 dark:divide-surface-700"
      >
        <li v-for="item in items" :key="item.productId" class="flex items-center gap-3 py-2">
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">
              {{ [item.brand, item.description].filter(Boolean).join(' ') }}
            </div>
            <div class="text-xs text-muted-color">
              {{ item.internalCode }} · {{ formatCurrency(item.salePrice) }} ·
              {{ t('fieldset.history.vat', { vat: item.vat }) }}
            </div>
          </div>
          <template v-if="step === 'list'">
            <InputNumber
              v-model="item.quantity"
              showButtons
              buttonLayout="horizontal"
              :min="1"
              :max="item.stock"
              class="w-32"
              inputClass="!w-12 text-center"
            />
            <Button
              type="button"
              rounded
              text
              severity="secondary"
              icon="pi pi-trash"
              :aria-label="t('cart.remove')"
              v-tooltip.top="t('cart.remove')"
              @click="remove(item.productId)"
            />
          </template>
          <span v-else class="text-sm text-muted-color">{{
            t('cart.items', { count: item.quantity })
          }}</span>
          <span class="w-24 text-right font-medium tabular-nums">
            {{ formatCurrency(item.quantity * item.salePrice) }}
          </span>
        </li>
      </ul>

      <div v-if="items.length" class="flex justify-between items-center text-lg font-medium">
        <span>{{ t('cart.total') }}</span>
        <span class="tabular-nums">{{ formatCurrency(total) }}</span>
      </div>

      <!-- Secondo passo: data e scontrino, richiesti solo alla conferma -->
      <div
        v-if="items.length && step === 'confirm'"
        class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4 pt-3"
      >
        <InputDateField v-model="date" inputId="cartDate" :label="t('cart.date')" />
        <InputTextField
          v-model="receiptNumber"
          inputId="cartReceiptNumber"
          :label="t('cart.receiptNumber')"
        />
      </div>

      <div class="flex justify-between items-center w-full mt-2">
        <div class="flex gap-2">
          <Button
            v-if="step === 'confirm'"
            type="button"
            rounded
            text
            severity="secondary"
            icon="pi pi-arrow-left"
            :aria-label="t('cart.back')"
            v-tooltip.top="t('cart.back')"
            @click="step = 'list'"
          />
          <Button
            v-else
            type="button"
            rounded
            text
            severity="secondary"
            icon="pi pi-trash"
            :aria-label="t('cart.clear')"
            v-tooltip.top="t('cart.clear')"
            :disabled="!items.length"
            @click="onClear"
          />
        </div>
        <Button
          v-if="step === 'list'"
          type="button"
          :label="t('cart.next')"
          icon="pi pi-arrow-right"
          iconPos="right"
          :disabled="!items.length"
          @click="step = 'confirm'"
        />
        <Button
          v-else
          type="button"
          :label="t('cart.confirm')"
          icon="pi pi-check"
          :disabled="!date"
          :loading="saving"
          @click="onConfirm"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Dialog, InputNumber, OverlayBadge, useToast } from 'primevue'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import { useCart } from '@/composables/useCart'
import { useRoles } from '@/composables/useRoles'
import { addCartSale } from '@/services/api/productService'
import { formatCurrency } from '@/utils/currencyUtils'
import { useErrorHandler } from '@/utils/errorHandler'

const { t } = useI18n()
const toast = useToast()
const { canEdit } = useRoles()
const { handleApiError } = useErrorHandler()
const { items, visible, soldTick, count, total, remove, clear } = useCart()

const step = ref<'list' | 'confirm'>('list')
const date = ref<Date | undefined>(new Date())
const receiptNumber = ref<string>()
const saving = ref(false)

const open = () => {
  step.value = 'list'
  visible.value = true
}

// Se il carrello si svuota torna al primo passo
watch(
  items,
  (value) => {
    if (!value.length) {
      step.value = 'list'
      visible.value = false
    }
  },
  { deep: true },
)

const onClear = () => {
  clear()
  visible.value = false
}

const onConfirm = async () => {
  saving.value = true
  try {
    await addCartSale(
      date.value,
      receiptNumber.value || undefined,
      items.value.map(({ productId, quantity, vat, salePrice, notes }) => ({
        productId,
        quantity,
        vat,
        salePrice,
        notes,
      })),
    )
    toast.add({
      severity: 'success',
      summary: t('cart.done'),
      detail: t('cart.doneDetail'),
      life: 3000,
    })
    clear()
    visible.value = false
    receiptNumber.value = undefined
    date.value = new Date()
    soldTick.value++
  } catch (error) {
    handleApiError(error)
  } finally {
    saving.value = false
  }
}
</script>
