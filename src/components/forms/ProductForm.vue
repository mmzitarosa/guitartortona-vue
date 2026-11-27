<template>
  <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_17rem] gap-4 items-start">
    <Card class="lg:col-start-1">
      <template #title>
        <div class="flex flex-wrap items-start justify-between gap-2">
          <span>{{ constants.card.title + condition }}</span>
          <Button
            v-if="product.usedReceiptId && canEdit"
            type="button"
            size="small"
            text
            icon="pi pi-file"
            :label="constants.receiptLink.label"
            @click="openReceipt"
          />
        </div>
      </template>
      <template #subtitle>{{ constants.card.subtitle + condition }}</template>
      <template #content>
        <ProgressBar
          :mode="formLoading ? 'indeterminate' : 'determinate'"
          class="mt-2 bg-gre"
          style="height: 1px"
        ></ProgressBar>

        <div class="grid gap-4 w-full mt-6">
          <!-- Prima riga: codice e codice interno-->
          <div class="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4 col-span-full">
            <InputTextField
              v-if="product.condition === 'USED'"
              v-model="product.usedReference"
              inputId="usedReference"
              :label="constants.usedReference.label"
              readonly
            />
            <InputTextField
              v-else
              v-model="product.code"
              inputId="code"
              :label="constants.code.label"
              readonly
            />

            <InputTextField
              v-model="product.internalCode"
              inputId="internalCode"
              :label="constants.internalCode.label"
              readonly
            />
          </div>

          <!-- Seconda riga: categoria e marca -->
          <div class="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4 col-span-full">
            <SelectField
              v-model="product.category"
              inputId="category"
              optionId="id"
              optionLabel="name"
              :options="categories"
              :optionDepth="getCategoryDepth"
              :label="constants.category.label"
              :readonly
              showClear
              :loading="categoriesLoading"
            />

            <SelectField
              v-model="product.brand"
              inputId="brand"
              optionId="id"
              optionLabel="name"
              :options="brands"
              editable
              showClear
              :label="constants.brand.label"
              :readonly
              :loading="brandsLoading"
              :formatter="brandFormatter"
            />
          </div>

          <!-- Terza riga: descrizione -->
          <div class="col-span-full">
            <TextAreaField
              v-model="product.description"
              inputId="description"
              :rows="2"
              :label="constants.description.label"
              :readonly
            />
          </div>

          <!-- Quarta riga: quantità prezzo vendita -->
          <div
            class="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4 col-span-full items-center"
          >
            <InputTextField
              :modelValue="
                (product.stock ?? 0) +
                ((product.pendingStock ?? 0) > 0 ? ' (+' + product.pendingStock + ')' : '')
              "
              inputId="quantity"
              :label="constants.quantity.label"
              readonly
            ></InputTextField>

            <InputAmountField
              v-model="product.price"
              inputId="price"
              :label="constants.price.label"
              :readonly
            />
          </div>

          <!-- Settima riga: note -->
          <div class="col-span-full">
            <TextAreaField
              v-model="product.notes"
              inputId="notes"
              :label="constants.notes.label"
              :readonly
            >
            </TextAreaField>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between items-center w-full mt-2">
          <!-- Bottoni di sinistra -->
          <div class="flex gap-2">
            <!-- Bottone Chiudi - Visualizzazione/Modifica senza cambiamenti-->
            <Button
              v-if="pristine"
              type="button"
              severity="secondary"
              :label="constants.close.label"
              :icon="constants.close.icon"
              @click="onFormClose"
            />
            <!-- Tasto Annulla - Inserimento/Modifica con cambiamenti -->
            <Button
              v-else
              type="button"
              severity="secondary"
              :label="constants.cancel.label"
              :icon="constants.cancel.icon"
              @click="onFormClose"
            />
            <!-- Tasto Reset - Inserimento/Modifica con cambiamenti  -->
            <Button
              type="button"
              v-if="dirty"
              :icon="constants.reset?.icon"
              severity="secondary"
              variant="text"
              rounded
              aria-label="Filter"
              @click="onFormReset"
            />
          </div>
          <!-- Bottoni di destra -->
          <div class="flex gap-2">
            <!-- Tasto Edit - Visualizzazione  -->
            <Button
              v-if="readonly && canEdit"
              type="button"
              rounded
              text
              icon="pi pi-pen-to-square"
              severity="secondary"
              @click="onFormEdit"
            />
            <!-- Tasto Rettifica giacenza - Visualizzazione -->
            <Button
              v-if="readonly && canEdit && pristine"
              type="button"
              rounded
              text
              severity="secondary"
              :icon="adjustConstants.adjust.icon"
              :aria-label="adjustConstants.adjust.label"
              v-tooltip.top="adjustConstants.adjust.label"
              @click="openAdjustment"
            />
            <!-- Tasto Stampa - Visualizzazione -->
            <Button
              v-if="readonly && pristine"
              type="button"
              rounded
              text
              severity="secondary"
              :icon="printConstants.print.icon"
              :aria-label="printConstants.print.label"
              v-tooltip.top="printConstants.print.label"
              @click="printDialog = true"
            />
            <!-- Tasto Aggiorna - Modifica con cambiamenti   -->
            <Button
              v-if="dirty"
              type="button"
              :label="constants.update.label"
              :icon="constants.update.icon"
              @click="onFormSubmit"
            />
          </div>
        </div>
      </template>
    </Card>
    <ProductTimeline
      class="lg:col-start-2 lg:row-span-2"
      :productId="product.id"
      :refreshKey="historyKey"
    />
  </div>

  <Button
    v-if="readonly && canEdit && (product.stock ?? 0) > 0"
    type="button"
    rounded
    size="large"
    icon="pi pi-shopping-cart"
    :aria-label="saleConstants.fieldset.legend"
    v-tooltip.left="saleConstants.fieldset.legend"
    class="!fixed bottom-6 right-6 z-40 !w-14 !h-14 shadow-lg"
    @click="saleDialog = true"
  />

  <Dialog
    :visible="saleDialog"
    @update:visible="(visible: boolean) => (visible ? (saleDialog = true) : onSaleClose())"
    modal
    :focusOnShow="false"
    :pt="{ pcCloseButton: { root: { class: '!outline-none' } } }"
    :header="saleConstants.fieldset.legend"
    class="w-[40rem] max-w-[95vw]"
  >
    <SaleForm
      v-model="saleForm.item.value"
      @submit="onSaleSubmit"
      @reset="saleForm.handleReset"
      @close="onSaleClose"
      @cart="onAddToCart"
      editable
      :loading="saleForm.loading.value"
      :validation="saleForm.validation.value"
      :changes="saleForm.changes.value"
      :dirty="saleForm.dirty.value"
      :pristine="saleForm.pristine.value"
      :existingItem="saleForm.existingItem.value"
      :max="product.stock || 0"
    />
  </Dialog>

  <Dialog
    :visible="adjustDialog"
    @update:visible="(visible: boolean) => (visible ? (adjustDialog = true) : onAdjustClose())"
    modal
    :focusOnShow="false"
    :pt="{ pcCloseButton: { root: { class: '!outline-none' } } }"
    :header="adjustConstants.fieldset.legend"
    class="w-[40rem] max-w-[95vw]"
  >
    <StockAdjustmentForm
      v-model="adjustForm.item.value"
      @submit="onAdjustSubmit"
      @reset="adjustForm.handleReset"
      :loading="adjustForm.loading.value"
      :validation="adjustForm.validation.value"
      :changes="adjustForm.changes.value"
      :dirty="adjustForm.dirty.value"
      :stock="product.stock"
    />
  </Dialog>

  <Dialog
    v-model:visible="printDialog"
    modal
    :focusOnShow="false"
    :pt="{ pcCloseButton: { root: { class: '!outline-none' } } }"
    :header="printConstants.fieldset.legend"
    class="w-[36rem] max-w-[95vw]"
  >
    <PrintFieldset :model-value="product" @print="onPrint" />
  </Dialog>
  <ChangesDialog :changes="changes"></ChangesDialog>
</template>

<script setup lang="ts">
import { useRoles } from '@/composables/useRoles'
import { useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import Card from 'primevue/card'
import { Button, Dialog, ProgressBar, useToast } from 'primevue'
import { useI18n } from 'vue-i18n'
import { useCart } from '@/composables/useCart'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import SelectField from '@/components/layout/fields/SelectField.vue'
import { useCategories } from '@/composables/useCategories'
import { useBrands } from '@/composables/useBrands'
import type { Product } from '@/types/product'

import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import SaleForm from './SaleForm.vue'
import StockAdjustmentForm from './StockAdjustmentForm.vue'
import type { StockAdjustment } from '@/types/stockAdjustment'
import type { Sale } from '@/types/sale'
import { useProduct } from '@/composables/useProduct'
import PrintFieldset from './PrintFieldset.vue'
import ProductTimeline from './ProductTimeline.vue'
import { useForm } from '@/composables/useForm'
import { formatDate } from '@/utils/dateUtils'
import {
  useProductPrintConstants,
  useProductSaleConstants,
  useStockAdjustmentConstants,
} from '@/utils/i18nConstants'
import { formatCurrency } from '@/utils/currencyUtils'
import { addProductSale, adjustProductStock } from '@/services/api/productService'

const { canEdit } = useRoles()
const router = useRouter()

const openReceipt = () =>
  router.push({
    name: 'usedReceipt',
    params: { id: product.value.usedReceiptId },
    query: { editable: 'false' },
  })
const { t } = useI18n()

const emit = defineEmits<{
  submit: [product: Product]
  close: []
  edit: []
}>()

const condition = computed(() =>
  product.value.condition ? ' - ' + constants.card.condition[product.value.condition] : '',
)

interface ProductFormProps {
  id: string | number | null | undefined
  editable: boolean
}

const props = withDefaults(defineProps<ProductFormProps>(), {
  editable: false,
})

const { categories, loading: categoriesLoading, getCategoryDepth } = useCategories()
const { brands, loading: brandsLoading, formatter: brandFormatter } = useBrands()

const {
  product,
  loading: formLoading,
  changes,
  dirty,
  pristine,
  loadProduct,
  validation,
  handleSubmit,
  handleReset,
  handleClose,
  handlePrint,
  constants,
  setProduct,
} = useProduct()

const readonly = computed(() => !props.editable)

onMounted(async () => {
  formLoading.value = true
  await loadProduct(props.id as number)

  // Imposto il prezzo di vendita iniziale della vendita al prezzo del prodotto caricato
  saleForm.setItem({
    ...saleForm.item.value,
    salePrice: product.value.price,
  })

  formLoading.value = false
})

const onFormSubmit = async () => {
  const result = await handleSubmit()
  if (result) historyKey.value++
  if (result && result !== true) emit('submit', result)
}

const onFormReset = async () => {
  await handleReset()
}

const onFormEdit = () => {
  emit('edit')
}

const onFormClose = async () => {
  if (await handleClose()) emit('close')
}

const onPrint = (quantity: number) => {
  printDialog.value = false
  handlePrint(quantity)
}

/* SALE */

const saleConstants = useProductSaleConstants()
const printConstants = useProductPrintConstants()
const saleDialog = ref(false)
// Con modifiche non salvate la chiusura chiede conferma
const onSaleClose = async () => {
  if (await saleForm.handleClose()) saleDialog.value = false
}
const printDialog = ref(false)

const fieldMappings = [
  {
    key: 'date',
    label: saleConstants.date.label,
    labeler: (date?: Date) => formatDate(date),
    validator: (date?: Date) => {
      if (!date) return { message: saleConstants.date.messages.required }
    },
    defaultValue: true,
  },
  {
    key: 'quantity',
    label: saleConstants.quantity.label,
    validator: (quantity?: number) => {
      if (!quantity) return { message: saleConstants.quantity.messages.required }
      else if (!product.value.stock || quantity > product.value.stock)
        return { message: saleConstants.quantity.messages.invalid }
    },
    defaultValue: true,
  },
  {
    key: 'vat',
    label: saleConstants.vat.label,
    labeler: (vat: number | undefined) => (vat ? `${vat}%` : undefined),
    defaultValue: true,
  },
  {
    key: 'receiptNumber',
    label: saleConstants.receiptNumber.label,
    validator: (receiptNumber?: string) => {
      if (receiptNumber && receiptNumber.length > 5)
        return { message: saleConstants.receiptNumber.messages.tooLong }
    },
  },
  {
    key: 'salePrice',
    label: saleConstants.price.label,
    labeler: formatCurrency,
    defaultValue: true,
  },
  { key: 'notes', label: saleConstants.notes.label },
]

const saleForm = useForm<Sale, Product>({
  initialValue: {
    date: new Date(),
    quantity: 1,
    vat: 22,
  },
  group: 'saleDifferences',
  create: (item: Sale) => addProductSale(product.value.id!, item),
  fieldMappings,
})

const historyKey = ref(0)

const { add: addToCart, quantityInCart, soldTick } = useCart()
const toast = useToast()

// Riparte da un form pulito mantenendo il prezzo di listino del prodotto
const resetSaleForm = () => {
  saleForm.resetOriginal()
  saleForm.setItem({ ...saleForm.item.value, salePrice: product.value.price })
}

const onAddToCart = () => {
  const { quantity, salePrice, vat, notes } = saleForm.item.value
  const inCart = quantityInCart(product.value.id)
  if (!quantity || !salePrice || vat == null) {
    toast.add({ severity: 'warn', summary: saleConstants.quantity.messages.required, life: 3000 })
    return
  }
  if (quantity + inCart > (product.value.stock ?? 0)) {
    toast.add({
      severity: 'warn',
      summary: t('cart.noStock', { inCart }),
      life: 4000,
    })
    return
  }
  addToCart({
    productId: product.value.id!,
    internalCode: product.value.internalCode,
    brand: product.value.brand?.name,
    description: product.value.description,
    quantity,
    salePrice,
    vat,
    notes,
    stock: product.value.stock ?? 0,
  })
  toast.add({ severity: 'success', summary: t('cart.added'), life: 2000 })
  resetSaleForm()
  saleDialog.value = false
}

// Dopo la vendita del carrello ricarico giacenza e storico
watch(soldTick, async () => {
  await loadProduct(props.id as number)
  historyKey.value++
})

const onSaleSubmit = async () => {
  const result = await saleForm.handleSubmit()
  if (result) {
    setProduct(result as Product)
    resetSaleForm()
    historyKey.value++
    saleDialog.value = false
  }
}

/* STOCK ADJUSTMENT */

const adjustConstants = useStockAdjustmentConstants()
const adjustDialog = ref(false)

const adjustForm = useForm<StockAdjustment, Product>({
  group: 'stockAdjustmentDifferences',
  create: (item: StockAdjustment) => adjustProductStock(product.value.id!, item),
  fieldMappings: [
    {
      key: 'countedStock',
      label: adjustConstants.countedStock.label,
      validator: (counted?: number) => {
        if (counted == null) return { message: adjustConstants.countedStock.messages.required }
        if (counted === (product.value.stock ?? 0))
          return { message: adjustConstants.countedStock.messages.same }
      },
    },
    {
      key: 'reason',
      label: adjustConstants.reason.label,
      validator: (reason?: string) => {
        if (!reason?.trim()) return { message: adjustConstants.reason.messages.required }
      },
    },
  ],
})

// Parte dalla giacenza attuale: la rettifica è la differenza con la quantità contata
const resetAdjustForm = () => {
  adjustForm.resetOriginal()
  adjustForm.setItem({ countedStock: product.value.stock ?? 0 })
}

const openAdjustment = () => {
  resetAdjustForm()
  adjustDialog.value = true
}

const onAdjustClose = async () => {
  if (await adjustForm.handleClose()) adjustDialog.value = false
}

const onAdjustSubmit = async () => {
  const result = await adjustForm.handleSubmit()
  if (result) {
    setProduct(result as Product)
    historyKey.value++
    adjustDialog.value = false
  }
}
</script>
