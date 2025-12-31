<template>
  <div v-if="hasProducts" class="mt-6">
    <DataTable
      :value="products"
      dataKey="id"
      rowHover
      selectionMode="single"
      @rowSelect="onView($event.data)"
    >
      <template #empty>{{ constants.table.empty }}</template>
      <template #loading>{{ constants.table.loading }}</template>
      <Column header="Categoria" style="min-width: 14rem">
        <template #body="{ data }">
          <p v-if="data.product.categoryId">{{ getCategory(data.product.categoryId)?.name }}</p>
        </template>
      </Column>
      <Column header="Marca" style="min-width: 14rem">
        <template #body="{ data }">
          <p v-if="data.product.brandId">{{ getBrand(data.product.brandId)?.name }}</p>
        </template>
      </Column>
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
import { computed } from 'vue'
import { Column, DataTable, ColumnGroup, Row } from 'primevue'
import type { IncomingInvoice } from '@/types/incomingInvoice'
import type { IncomingInvoiceProductLight } from '@/types/incomingInvoiceProduct'
import { useIncomingInvoiceProductsTable } from '@/composables/useIncomingInvoiceProductsTable'
import { useIncomingInvoiceProductsTableConstants } from '@/utils/i18nConstants'
import { useBrands } from '@/composables/useBrands'
import { useCategories } from '@/composables/useCategories'

interface IncomingInvoiceProductsTableProps {
  invoice: IncomingInvoice
  editable?: boolean
}

const props = withDefaults(defineProps<IncomingInvoiceProductsTableProps>(), {
  editable: false,
})

const emit = defineEmits<{
  edit: [product: IncomingInvoiceProductLight]
  view: [product: IncomingInvoiceProductLight]
}>()
const constants = useIncomingInvoiceProductsTableConstants()

const { getBrand } = useBrands()

const { getCategory } = useCategories()

const {
  products,
  hasProducts,
  totalQuantityFormatted,
  totalPurchasePriceFormatted,
  totalAmountFormatted,
  formatCurrency,
  formatProductAmount,
} = useIncomingInvoiceProductsTable(computed(() => props.invoice))

const onView = (product: IncomingInvoiceProductLight) => {
  emit('view', product)
}
</script>
