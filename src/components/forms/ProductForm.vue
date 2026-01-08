<template>
  <Card>
    <template #title>{{ constants.card.title + condition }}</template>
    <template #subtitle>{{ constants.card.subtitle + condition }}</template>
    <template #content>
      <ProgressBar
        :mode="formLoading ? 'indeterminate' : 'determinate'"
        class="mt-2 bg-gre"
        style="height: 1px"
      ></ProgressBar>

      <div class="grid gap-4 w-full mt-6">
        <!-- Prima riga: codice e codice interno-->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <InputTextField
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <SelectField
            v-model="product.category"
            inputId="category"
            optionId="id"
            optionLabel="name"
            :options="categories"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full items-center">
          <InputTextField
            :modelValue="
              (product.stock ?? 0) +
              (product.pendingStock ? ' (+' + product.pendingStock + ')' : '')
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
            v-if="readonly"
            type="button"
            rounded
            text
            icon="pi pi-pen-to-square"
            severity="secondary"
            @click="onFormEdit"
          />
          <!-- Tasto Aggiorna - Modifica con cambiamenti   -->
          <Button
            v-else-if="dirty"
            type="button"
            :label="constants.update.label"
            :icon="constants.update.icon"
            @click="onFormSubmit"
          />
        </div>
      </div>

      <div v-if="readonly" class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full mt-2">
        <PrintFieldset :model-value="product" @print="onPrint"></PrintFieldset>
        <SaleForm
          v-model="saleForm.item.value"
          @submit="onSaleSubmit"
          @reset="saleForm.handleReset"
          editable
          :loading="saleForm.loading.value"
          :validation="saleForm.validation.value"
          :changes="saleForm.changes.value"
          :dirty="saleForm.dirty.value"
          :pristine="saleForm.pristine.value"
          :existingItem="saleForm.existingItem.value"
          :max="product.stock || 0"
        />
      </div>
    </template>
  </Card>
  <ChangesDialog :changes="changes"></ChangesDialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Card from 'primevue/card'
import { Button, ProgressBar } from 'primevue'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import SelectField from '@/components/layout/fields/SelectField.vue'
import { useCategories } from '@/composables/useCategories'
import { useBrands } from '@/composables/useBrands'
import type { Product } from '@/types/product'

import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import SaleForm from './SaleForm.vue'
import type { Sale } from '@/types/sale'
import { useProduct } from '@/composables/useProduct'
import PrintFieldset from './PrintFieldset.vue'
import { useForm } from '@/composables/useForm'
import { formatDate } from '@/utils/dateUtils'
import { useProductSaleConstants } from '@/utils/i18nConstants'
import { formatCurrency } from '@/utils/currencyUtils'
import { addProductSale } from '@/services/api/productService'

const emit = defineEmits<{
  submit: [product: Product]
  close: []
  edit: []
  delete: []
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

const { categories, loading: categoriesLoading } = useCategories()
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
  setProduct
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
  if (result) emit('submit', result)
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
  handlePrint(quantity)
}

/* SALE */

const saleConstants = useProductSaleConstants()

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

const onSaleSubmit = async () => {
  const result = await saleForm.handleSubmit()
  if (result) {
    setProduct(result as Product)
    saleForm.resetOriginal()
  }
}
</script>
