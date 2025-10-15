<template>
  <Fieldset :legend="constants.fieldset.legend"
            :class="incomingInvoiceProduct.product ? 'w-full md:max-w-1/2' : ''">
    <ProgressBar
      :mode="formLoading ? 'indeterminate' : 'determinate'"
      class="mt-2 bg-gre"
      style="height: 1px"
    ></ProgressBar>
    <div class="grid gap-4 mt-6" v-if="incomingInvoiceProduct.product === undefined">
      <!-- Campo di input per codice a barre o nome prodotto -->
      <div class="w-72 mx-auto">
        <ProductSearch @search="onSearch" :label="constants.barcode.label"></ProductSearch>
      </div>

      <div class="flex items-center justify-center">

        <Button
          type="button"
          severity="secondary"
          :label="constants.add.label"
          :icon="constants.add.icon"
          @click="setProduct({})"
        />
      </div>


    </div>
    <!-- Form di inserimento/modifica prodotto -->
    <div class="grid gap-4 mt-6" v-else>

      <InputTextField v-if="incomingInvoiceProduct.product.code"
                      v-model="incomingInvoiceProduct.product.code"
                      inputId="code"
                      :label="constants.code.label"
                      readonly
      />

      <InputTextField v-if="incomingInvoiceProduct.product.internalCode"
                      v-model="incomingInvoiceProduct.product.internalCode"
                      inputId="internalCode"
                      :label="constants.internalCode.label"
                      readonly
      />

      <SelectField
        v-model="incomingInvoiceProduct.product.category"
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
        v-model="incomingInvoiceProduct.product.brand"
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

      <TextAreaField
        v-model="incomingInvoiceProduct.product.description"
        inputId="description"
        :rows="2"
        :label="constants.description.label"
        :readonly
      />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-full">

        <VatRateField input-id="vat" label="IVA" v-model="incomingInvoiceProduct.vat" />

        <div class="md:col-span-2">
          <InputAmountField
            v-model="incomingInvoiceProduct.purchasePrice"
            inputId="purchasePrice"
            :label="constants.purchasePrice.label"
            :tooltip="taxedPurchasePrice"
            :readonly
          />
        </div>

      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-full">

        <InputNumberField v-model="incomingInvoiceProduct.quantity" inputId="quantity" :label="constants.quantity.label" :readonly />

        <div class="md:col-span-2">
          <InputAmountField
            v-model="incomingInvoiceProduct.product.price"
            inputId="price"
            :label="constants.price.label"
            :readonly
          />
        </div>

      </div>

      <TextAreaField
        v-model="incomingInvoiceProduct.product.notes"
        inputId="notes"
        :label="constants.notes.label"
        :readonly />

      <div class="flex justify-between items-center w-full mt-2">
        <!-- Bottoni di sinistra -->
        <div class="flex gap-2">
          <!-- Bottone Chiudi - Visualizzazione/Modifica senza cambiamenti-->
          <Button
            v-if="existingItem && pristine"
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
          <!-- Tasto Delete - Visualizzazione  -->
          <Button
            v-if="readonly"
            type="button"
            rounded
            text
            icon="pi pi-trash"
            severity="secondary"
            @click="onFormDelete"
          />

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

          <!-- Tasto Aggiungi - Inserimento  -->
          <Button
            v-else-if="!existingItem"
            type="button"
            :label="constants.save.label"
            :icon="constants.save.icon"
            @click="onFormSubmit"
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
    </div>
  </Fieldset>
  <ChangesDialog :changes group="productDifferences"></ChangesDialog>
</template>

<script setup lang="ts">
import { Button, Fieldset, ProgressBar } from 'primevue'
import ProductSearch from '@/components/forms/incomininvoice/ProductSearch.vue'
import { getProduct } from '@/services/api/productService.ts'
import { computed, onMounted } from 'vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import SelectField from '@/components/layout/fields/SelectField.vue'
import { useBrands } from '@/composables/useBrands.ts'
import { useIncomingInvoiceProductConstants } from '@/utils/i18nConstants.ts'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import VatRateField from '@/components/layout/fields/VatRateField.vue'
import InputNumberField from '@/components/layout/fields/InputNumberField.vue'
import { useIncomingInvoiceProduct } from '@/composables/useIncomingInvoiceProduct.ts'
import { useCategories } from '@/composables/useCategories.ts'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import type { Category } from '@/types/category.ts'
import type { Brand } from '@/types/brand.ts'
import {
  deleteIncomingInvoiceProductById,
  getIncomingInvoiceProductById,
  postIncomingInvoiceProduct,
  putIncomingInvoiceProductById
} from '@/services/api/incomingInvoiceService.ts'

const emit = defineEmits(['submit', 'close', 'edit', 'delete'])

const constants = useIncomingInvoiceProductConstants()

interface IncomingInvoiceProductFormProps {
  incomingInvoiceId: number
  id?: number
  editable?: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceProductFormProps>(), {
  editable: false
})

const {
  brands,
  loading: brandsLoading,
  loadBrands,
  formatter: brandFormatter,
  addBrand
} = useBrands()

const {
  categories,
  loading: categoriesLoading,
  loadCategories,
} = useCategories()

const {
  item: incomingInvoiceProduct,
  loading: formLoading,
  changes,
  dirty,
  pristine,
  loadItem: loadProduct,
  validation,
  existingItem,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete,
  setProduct
} = useIncomingInvoiceProduct({
  initialItem: {
    quantity: 1,
    vat: 22
  },
  invoiceId: props.incomingInvoiceId,
  create: postIncomingInvoiceProduct,
  getById: getIncomingInvoiceProductById,
  update: putIncomingInvoiceProductById,
  remove: deleteIncomingInvoiceProductById,
  fieldMappings: [
    {key: 'product.code', label: constants.code.label},
    {key: 'product.internalCode', label: constants.internalCode.label},
    {key: 'product.category', label: constants.category.label, labeler: (category: Category | undefined) => category?.name},
    {key: 'product.brand', label: constants.brand.label, labeler: (brand: Brand | undefined) => brand?.name},
    {key: 'product.description', label: constants.description.label},
    {key: 'vat', label: constants.vat.label, labeler: (vat: number | undefined) => vat ? vat+'%' : undefined, defaultValue: true},
    {key: 'product.price', label: constants.price.label, labeler: (amount: number | undefined) => amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })},
    {key: 'quantity', label: constants.quantity.label, defaultValue: true},
    {key: 'purchasePrice', label: constants.purchasePrice.label, labeler: (amount: number | undefined) => amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })},
    {key: 'product.notes', label: constants.notes.label}
  ],
})

const readonly = computed(() => !props.editable)

onMounted(async () => {
  formLoading.value = true
  await loadBrands()
  await loadCategories()
  formLoading.value = false
})

const onFormSubmit = async () => {
  const result = await handleSubmit()
  if (!result) return
  addBrand(result.product?.brand)
  emit('submit', result)
}

const onFormReset = async () => {
  await handleReset()
}

const onFormEdit = () => {
  emit('edit')
}

const onFormDelete = async () => {
  await handleDelete()
  emit('delete')
}

const onFormClose = async () => {
  await handleClose()
  emit('close')
}

const taxedPurchasePrice = computed(() => {
  if (incomingInvoiceProduct.value.purchasePrice && incomingInvoiceProduct.value.vat) {
    return (incomingInvoiceProduct.value.purchasePrice * (1 + incomingInvoiceProduct.value.vat / 100)).toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR'
    })
  }
  return undefined
})

const onSearch = async (value: string) => {
  try {
    setProduct(await getProduct(value))
  } catch (error) {
    setProduct({ code: value })
  }
}


</script>
