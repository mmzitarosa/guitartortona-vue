<template>
  <Fieldset :legend="constants.fieldset.legend" :class="model.product ? 'w-full md:max-w-3/4' : ''">
    <ProgressBar
      :mode="loading ? 'indeterminate' : 'determinate'"
      class="mt-2 bg-gre"
      style="height: 1px"
    ></ProgressBar>
    <div class="grid gap-4 mt-6" v-if="model.product === undefined">
      <div class="flex items-center justify-center">
        <Button
          type="button"
          severity="secondary"
          :label="constants.add.label"
          :icon="constants.add.icon"
          @click="emit('new')"
        />
      </div>
    </div>
    <!-- Form di inserimento/modifica prodotto usato -->
    <div class="grid gap-4 mt-6" v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
        <InputTextField
          v-model="model.reference"
          inputId="reference"
          placeholder="AUTO"
          :label="constants.reference.label"
          readonly
        />

        <InputTextField
          v-model="model.product.internalCode"
          inputId="internalCode"
          placeholder="AUTO"
          :label="constants.internalCode.label"
          readonly
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 grid-rows-1 gap-4 col-span-full">
        <SelectField
          v-model="model.product.category"
          inputId="category"
          optionId="id"
          optionLabel="name"
          :options="categories"
          :optionDepth="getCategoryDepth"
          :label="constants.category.label"
          showClear
          :loading="categoriesLoading"
          :validation="validation.fields['product.category']"
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
          :loading="brandsLoading"
          :formatter="brandFormatter"
          :validation="validation.fields['product.brand']"
        />
      </div>

      <TextAreaField
        v-model="model.product.description"
        inputId="description"
        :rows="2"
        :label="constants.description.label"
        :validation="validation.fields['product.description']"
      />

      <Divider align="right" type="dashed" class="!m-0 !mb-1">{{
        constants.purchaseDivider
      }}</Divider>

      <div class="grid grid-cols-1 md:grid-cols-4 grid-rows-1 gap-4 col-span-full">
        <InputNumberField
          :modelValue="1"
          inputId="quantity"
          :label="constants.quantity.label"
          readonly
        />

        <VatRateField inputId="vat" :label="constants.vat.label" v-model="model.vat" />

        <div class="md:col-span-2">
          <InputAmountField
            v-model="model.purchasePrice"
            inputId="purchasePrice"
            :label="constants.purchasePrice.label"
            :validation="validation.fields['purchasePrice']"
          />
        </div>
      </div>

      <Divider align="right" type="dashed" class="!m-0 !mb-1">{{ constants.saleDivider }}</Divider>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full items-center">
        <span class="hidden md:block"></span>

        <InputAmountField
          v-model="model.product.price"
          inputId="price"
          :label="constants.price.label"
          :validation="validation.fields['product.price']"
        />
      </div>

      <TextAreaField
        v-model="model.product.notes"
        inputId="notes"
        :label="constants.notes.label"
        :validation="validation.fields['product.notes']"
      />

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
            @click="emit('close')"
          />
          <!-- Tasto Annulla - Inserimento/Modifica con cambiamenti -->
          <Button
            v-else
            type="button"
            severity="secondary"
            :label="constants.cancel.label"
            :icon="constants.cancel.icon"
            @click="emit('close')"
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
            @click="emit('reset')"
          />
        </div>

        <!-- Bottoni di destra -->
        <div class="flex gap-2">
          <!-- Tasto Delete - Visualizzazione  -->
          <Button
            v-if="canDelete && existingItem"
            type="button"
            rounded
            text
            icon="pi pi-trash"
            severity="secondary"
            @click="emit('delete')"
          />
          <Button
            v-if="existingItem && model.product.internalCode"
            type="button"
            rounded
            text
            icon="pi pi-print"
            severity="secondary"
            @click="emit('print')"
          />

          <!-- Tasto Aggiungi - Inserimento  -->
          <Button
            v-if="!existingItem"
            type="button"
            :label="constants.save.label"
            :icon="constants.save.icon"
            @click="emit('submit')"
          />

          <!-- Tasto Aggiorna - Modifica con cambiamenti   -->
          <Button
            v-else-if="dirty"
            type="button"
            :label="constants.update.label"
            :icon="constants.update.icon"
            @click="emit('submit')"
          />
        </div>
      </div>
    </div>
  </Fieldset>
  <ChangesDialog :changes group="productDifferences"></ChangesDialog>
</template>

<script setup lang="ts">
import { useRoles } from '@/composables/useRoles'
import { Button, Divider, Fieldset, ProgressBar } from 'primevue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import SelectField from '@/components/layout/fields/SelectField.vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import InputNumberField from '@/components/layout/fields/InputNumberField.vue'
import VatRateField from '@/components/layout/fields/VatRateField.vue'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import { useBrands } from '@/composables/useBrands'
import { useCategories } from '@/composables/useCategories'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'
import type { UsedReceiptProduct } from '@/types/usedReceiptProduct'
import type { FieldChange } from '@/composables/useOriginalData'

const { product: constants } = useUsedReceiptConstants()

interface ValidationResult {
  fields: Record<string, { message?: string; valid: boolean }>
  valid: boolean
}

interface UsedReceiptProductFormProps {
  loading?: boolean
  validation: ValidationResult
  changes: FieldChange[]
  dirty: boolean
  pristine: boolean
  existingItem: boolean
}

withDefaults(defineProps<UsedReceiptProductFormProps>(), {
  loading: false,
})

const { canDelete } = useRoles()

const emit = defineEmits(['submit', 'close', 'delete', 'reset', 'new', 'print'])
const model = defineModel<UsedReceiptProduct>({ required: true })

const { brands, loading: brandsLoading, formatter: brandFormatter } = useBrands()
const { categories, loading: categoriesLoading, getCategoryDepth } = useCategories()
</script>
