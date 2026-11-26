<template>
  <div v-if="hasProducts" class="mt-6">
    <DataTable
      :value="products"
      dataKey="id"
      rowHover
      selectionMode="single"
      @rowSelect="onView($event.data)"
    >
      <template #empty>{{ constants.empty }}</template>
      <!-- Numero/Anno Lettera: assegnato alla registrazione -->
      <Column v-if="registered" :header="constants.columns.number">
        <template #body="{ data }">
          <p>{{ data.reference }}</p>
        </template>
      </Column>

      <Column :header="constants.columns.category" style="min-width: 14rem">
        <template #body="{ data }">
          <p v-if="data.product?.categoryId">{{ getCategory(data.product.categoryId)?.name }}</p>
        </template>
      </Column>
      <Column :header="constants.columns.brand" style="min-width: 14rem">
        <template #body="{ data }">
          <p v-if="data.product?.brandId">{{ getBrand(data.product.brandId)?.name }}</p>
        </template>
      </Column>
      <Column field="product.description" :header="constants.columns.description"></Column>

      <Column :header="constants.columns.amount">
        <template #body="{ data }">
          <p v-if="data.purchasePrice">{{ formatCurrency(data.purchasePrice) }}</p>
        </template>
      </Column>

      <Column :header="constants.columns.vat">
        <template #body="{ data }">
          <p>{{ (data.vat ?? 0) + '%' }}</p>
        </template>
      </Column>

      <Column :header="constants.columns.sale">
        <template #body="{ data }">
          <p v-if="data.product?.price">{{ formatCurrency(data.product.price) }}</p>
        </template>
      </Column>

      <ColumnGroup type="footer">
        <Row>
          <Column :colspan="registered ? 3 : 2" />
          <Column :footer="constants.total" />
          <Column :footer="formatCurrency(total)" />
          <Column :colspan="2" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Column, ColumnGroup, DataTable, Row } from 'primevue'
import type { UsedReceipt } from '@/types/usedReceipt'
import { receiptAmount } from '@/types/usedReceipt'
import type { UsedReceiptProductLight } from '@/types/usedReceiptProduct'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'
import { useBrands } from '@/composables/useBrands'
import { useCategories } from '@/composables/useCategories'
import { formatCurrency } from '@/utils/currencyUtils'

interface UsedReceiptProductsTableProps {
  receipt: UsedReceipt
}

const props = defineProps<UsedReceiptProductsTableProps>()

const emit = defineEmits<{
  view: [product: UsedReceiptProductLight]
}>()

const { table: constants } = useUsedReceiptConstants()
const { getBrand } = useBrands()
const { getCategory } = useCategories()

const products = computed(() => props.receipt.items ?? [])
const hasProducts = computed(() => products.value.length > 0)
const total = computed(() => receiptAmount(props.receipt))

// Dopo la registrazione i prodotti hanno il riferimento Numero/Anno Lettera
const registered = computed(() => props.receipt.status === 'COMPLETED')

const onView = (product: UsedReceiptProductLight) => emit('view', product)
</script>
