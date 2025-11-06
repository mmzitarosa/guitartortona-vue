<template>
  <Fieldset :legend="constants.fieldset.legend"
            :class="model.product ? 'w-full md:max-w-1/2' : ''">
    <ProgressBar
      :mode="loading ? 'indeterminate' : 'determinate'"
      class="mt-2 bg-gre"
      style="height: 1px"
    ></ProgressBar>
    <div class="grid gap-4 mt-6" v-if="model.product === undefined">
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
          @click="onSearch(undefined)"
        />
      </div>


    </div>
    <!-- Form di inserimento/modifica prodotto -->
    <div class="grid gap-4 mt-6" v-else>

      <InputTextField v-if="model.product.code"
                      v-model="model.product.code"
                      inputId="code"
                      :label="constants.code.label"
                      readonly
      />

      <InputTextField v-if="model.product.internalCode"
                      v-model="model.product.internalCode"
                      inputId="internalCode"
                      :label="constants.internalCode.label"
                      readonly
      />

      <SelectField
        v-model="model.product.category"
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
        v-model="model.product.brand"
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
        v-model="model.product.description"
        inputId="description"
        :rows="2"
        :label="constants.description.label"
        :readonly
      />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-full">

        <VatRateField input-id="vat" label="IVA" v-model="model.vat" />

        <div class="md:col-span-2">
          <InputAmountField
            v-model="model.purchasePrice"
            inputId="purchasePrice"
            :label="constants.purchasePrice.label"
            :tooltip="taxedPurchasePrice"
            :readonly
          />
        </div>

      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-full">

        <InputNumberField v-model="model.quantity" inputId="quantity" :label="constants.quantity.label" :readonly />

        <div class="md:col-span-2">
          <InputAmountField
            v-model="model.product.price"
            inputId="price"
            :label="constants.price.label"
            :readonly
          />
        </div>

      </div>

      <TextAreaField
        v-model="model.product.notes"
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
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct.ts'

const constants = useIncomingInvoiceProductConstants()

interface IncomingInvoiceProductFormProps {
  editable?: boolean
  loading?: boolean
  validation: any
  changes: any[]
  dirty: boolean
  pristine: boolean
  existingItem: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceProductFormProps>(), {
  editable: false,
  loading: false
})

const emit = defineEmits(['submit', 'close', 'edit', 'delete', 'reset', 'search'])
const model = defineModel<IncomingInvoiceProduct>({required: true})

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

const readonly = computed(() => !props.editable)

onMounted(async () => {
  await loadBrands()
  await loadCategories()
})


const taxedPurchasePrice = computed(() => {
  if (model.value.purchasePrice && model.value.vat) {
    return (model.value.purchasePrice * (1 + model.value.vat / 100)).toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR'
    })
  }
  return undefined
})

const onSearch = async (value?: string) => {
  emit('search', value)
}


</script>
