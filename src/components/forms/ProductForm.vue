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
            input-id="quantity"
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
        <PrintForm :model-value="product" @print="onPrint"></PrintForm>
        <SaleForm :model-value="{} as Sale" />
      </div>
    </template>
  </Card>
  <ChangesDialog :changes="changes"></ChangesDialog>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
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
import PrintForm from './PrintForm.vue'
import { useProduct } from '@/composables/useProduct'

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
} = useProduct()

const readonly = computed(() => !props.editable)

onMounted(async () => {
  formLoading.value = true
  await loadProduct(props.id as number)
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
</script>
