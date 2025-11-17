<template>
  <Card>
    <template #title>Gestione Prodotti</template>
    <!-- TODO da i18n -->
    <template #subtitle>Dati Prodotti Fattura</template>
    <!-- TODO da i18n -->
    <template #content>
      <!-- Box per inserimento o scan codice a barre -->
      <div class="w-full flex items-center justify-center" v-if="editable">
        <IncomingInvoiceProductForm
          v-model="incomingInvoiceProduct"
          :editable
          :loading
          :validation
          :changes
          :dirty
          :pristine
          :existingItem
          @submit="onSubmit"
          @close="onClose"
          @delete="onDelete"
          @reset="onReset"
          @search="onSearch"
        />
      </div>

      <!-- Tabella con i prodotti inseriti -->
      <div v-if="modelValue.items && modelValue.items.length > 0" class="mt-6">
        <DataTable :value="model.items">
          <template #empty>Nessuna prodotto trovato.</template>
          <template #loading>Caricando i prodotti...</template>
          <Column field="product.category.name" header="Categoria"></Column>
          <Column field="product.brand.name" header="Marca"></Column>
          <Column field="product.description" header="Descrizione"></Column>
          <Column field="quantity" header="Quantità"></Column>
          <Column header="Acquisto">
            <template #body="{ data }">
              <p v-if="data.purchasePrice">
                {{
                  data.purchasePrice.toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                }}
              </p>
            </template>
          </Column>
          <Column header="Importo">
            <template #body="{ data }">
              <p v-if="data.quantity && data.purchasePrice">
                {{
                  (data.quantity * data.purchasePrice).toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                }}
              </p>
            </template>
          </Column>
          <Column header="IVA">
            <template #body="{ data }">
              <p v-if="data.vat">{{ data.vat + '%' }}</p>
            </template></Column
          >
          <Column header="Vendita">
            <template #body="{ data }">
              <p v-if="data.product && data.product.price">
                {{
                  data.product.price.toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                }}
              </p>
            </template>
          </Column>
          <Column class="w-0 !text-end">
            <template #body="{ data }">
              <span class="flex">
                <Button
                  v-if="editable"
                  type="button"
                  icon="pi pi-pencil"
                  severity="primary"
                  text
                  rounded
                  @click="setIncominInvoiceProduct(toRaw(data))"
                ></Button>
                <Button type="button" icon="pi pi-eye" severity="primary" text rounded></Button>
              </span>
            </template>
          </Column>
          <ColumnGroup type="footer">
            <Row>
              <Column :colspan="9" />
            </Row>
            <Row>
              <Column :colspan="2" />
              <Column footer="Totale" />
              <Column :footer="totalQuantity" />
              <Column footer="IVA Esclusa" />
              <Column :footer="totalPurchasePrice" />
              <Column :colspan="3" />
            </Row>
            <Row>
              <Column :colspan="4" />
              <Column footer="IVA Inclusa:" />
              <Column :footer="totalAmount" />
              <Column :colspan="3" />
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Column, DataTable, Button, ColumnGroup, Row } from 'primevue'
import IncomingInvoiceProductForm from '@/components/forms/incomininvoice/IncomingInvoiceProductForm.vue'
import {
  addProductToInvoice,
  removeProductFromInvoice,
  type IncomingInvoice,
} from '@/types/incomingInvoice.ts'
import { useIncomingInvoiceProduct } from '@/composables/useIncomingInvoiceProduct.ts'
import { getProduct } from '@/services/api/productService.ts'
import { computed, toRaw } from 'vue'

interface IncomingInvoiceProductProps {
  editable?: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceProductProps>(), {
  editable: false,
})

const model = defineModel<IncomingInvoice>({ required: true })

const {
  item: incomingInvoiceProduct,
  loading,
  validation,
  changes,
  dirty,
  pristine,
  existingItem,
  setIncominInvoiceProduct,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete,
  setProduct,
  closeProduct,
} = useIncomingInvoiceProduct(computed(() => model.value.id))

const onSearch = async (value?: string) => {
  if (value === undefined) return setProduct({})
  try {
    setProduct(await getProduct(value))
  } catch (error) {
    setProduct({ code: value })
  }
}

const onSubmit = async () => {
  const result = await handleSubmit()
  if (result) {
    addProductToInvoice(model.value, result)
    closeProduct()
  }
}

const onClose = async () => {
  await handleClose()
  closeProduct()
}

const onReset = async () => {
  await handleReset()
}

const onDelete = async () => {
  await handleDelete()
  removeProductFromInvoice(model.value, incomingInvoiceProduct.value.id!)
  closeProduct()
}

const totalQuantity = computed(() => {
  return model.value.items?.reduce((acc, cur) => (cur.quantity ? acc + cur.quantity : acc), 0) + ''
})

const totalPurchasePrice = computed(() => {
  return model.value.items
    ?.reduce(
      (acc, cur) =>
        cur.purchasePrice && cur.quantity ? acc + cur.quantity * cur.purchasePrice : acc,
      0,
    )
    .toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR',
    })
})

const totalAmount = computed(() => {
  return model.value.items
    ?.reduce(
      (acc, cur) =>
        cur.purchasePrice && cur.quantity && cur.vat
          ? acc + cur.quantity * cur.purchasePrice * (1 + cur.vat / 100)
          : acc,
      0,
    )
    .toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR',
    })
})
</script>
