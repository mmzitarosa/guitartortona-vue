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
          @close=""
          @edit=""
          @delete=""
          @reset=""
          @search="onSearch"
        />
      </div>

      <!-- Tabella con i prodotti inseriti -->
      <div v-if="modelValue.items && modelValue.items.length > 0" class="mt-6">
        <h3 class="text-lg font-semibold mb-4">Prodotti inseriti:</h3>
        <ul class="space-y-2">
          <li v-for="(item, index) in modelValue.items" :key="index" class="p-4 border rounded-lg">
            <div class="grid grid-cols-2 gap-2">
              <span class="font-medium">Codice:</span>
              <span>{{ item.product?.code || 'N/A' }}</span>

              <span class="font-medium">Descrizione:</span>
              <span>{{ item.product?.description || 'N/A' }}</span>

              <span class="font-medium">Quantità:</span>
              <span>{{ item.quantity }}</span>

              <span class="font-medium">Prezzo:</span>
              <span>{{
                item.purchasePrice?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
              }}</span>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import IncomingInvoiceProductForm from '@/components/forms/incomininvoice/IncomingInvoiceProductForm.vue'
import { addProductToInvoice, type IncomingInvoice } from '@/types/incomingInvoice.ts'
import { useIncomingInvoiceProduct } from '@/composables/useIncomingInvoiceProduct.ts'
import { getProduct } from '@/services/api/productService.ts'
import { computed } from 'vue'

interface IncomingInvoiceProductProps {
  id: number
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
  loadItem,
  handleSubmit,
  handleReset,
  handleClose,
  handleDelete,
  setProduct,
} = useIncomingInvoiceProduct(computed(() => model.value.id))

// Crea la fattura
//onMounted(() => {
//  incomingInvoiceProduct.value = {}
//})

const onSearch = async (value?: string) => {
  if (value === undefined) return setProduct({})
  try {
    setProduct(await getProduct(value))
  } catch (error) {
    setProduct({ code: value })
  }
}

const onSubmit = async () => {
  // Verifica che l'id della fattura sia disponibile prima di procedere
  if (!model.value.id) {
    console.warn('IncomingInvoice ID is not available yet')
    return
  }
  console.log(model.value)
  const result = await handleSubmit()
  if (result) {
    addProductToInvoice(model.value, result)
  }
}
</script>
