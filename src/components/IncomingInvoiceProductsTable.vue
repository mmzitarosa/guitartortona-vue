<template>
  <div v-if="hasProducts" class="mt-6">
    <DataTable :value="products">
      <template #empty>{{ constants.table.empty }}</template>
      <template #loading>{{ constants.table.loading }}</template>

      <Column field="product.category.name" :header="constants.table.columns.category"></Column>
      <Column field="product.brand.name" :header="constants.table.columns.brand"></Column>
      <Column field="product.description" :header="constants.table.columns.description"></Column>
      <Column field="quantity" :header="constants.table.columns.quantity"></Column>

      <Column :header="constants.table.columns.purchase">
        <template #body="{ data }">
          <p v-if="data.purchasePrice">{{ formatCurrency(data.purchasePrice) }}</p>
        </template>
      </Column>

      <Column :header="constants.table.columns.amount">
        <template #body="{ data }">
          <p v-if="data.quantity && data.purchasePrice">{{ formatProductAmount(data) }}</p>
        </template>
      </Column>

      <Column :header="constants.table.columns.vat">
        <template #body="{ data }">
          <p v-if="data.vat">{{ data.vat + '%' }}</p>
        </template>
      </Column>

      <Column :header="constants.table.columns.sale">
        <template #body="{ data }">
          <p v-if="data.product && data.product.price">{{ formatCurrency(data.product.price) }}</p>
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
              @click="onEdit(toRaw(data))"
            ></Button>
            <Button
              type="button"
              icon="pi pi-eye"
              severity="primary"
              text
              rounded
              @click="onView(toRaw(data))"
            ></Button>
          </span>
        </template>
      </Column>

      <ColumnGroup type="footer">
        <Row>
          <Column :colspan="9" />
        </Row>
        <Row>
          <Column :colspan="2" />
          <Column :footer="constants.table.footer.total" />
          <Column :footer="totalQuantityFormatted" />
          <Column :footer="constants.table.footer.vatExcluded" />
          <Column :footer="totalPurchasePriceFormatted" />
          <Column :colspan="3" />
        </Row>
        <Row>
          <Column :colspan="4" />
          <Column :footer="constants.table.footer.vatIncluded" />
          <Column :footer="totalAmountFormatted" />
          <Column :colspan="3" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { Column, DataTable, Button, ColumnGroup, Row } from 'primevue'
import type { IncomingInvoice } from '@/types/incomingInvoice'
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct'
import { useIncomingInvoiceProductsTable } from '@/composables/useIncomingInvoiceProductsTable'
import { useIncomingInvoiceProductsTableConstants } from '@/utils/i18nConstants'

interface IncomingInvoiceProductsTableProps {
  invoice: IncomingInvoice
  editable?: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceProductsTableProps>(), {
  editable: false,
})

const emit = defineEmits<{
  edit: [product: IncomingInvoiceProduct]
  view: [product: IncomingInvoiceProduct]
}>()

const constants = useIncomingInvoiceProductsTableConstants()

const {
  products,
  hasProducts,
  totalQuantityFormatted,
  totalPurchasePriceFormatted,
  totalAmountFormatted,
  formatCurrency,
  formatProductAmount,
} = useIncomingInvoiceProductsTable(computed(() => props.invoice))

const onEdit = (product: IncomingInvoiceProduct) => {
  emit('edit', product)
}

const onView = (product: IncomingInvoiceProduct) => {
  emit('view', product)
}
</script>
