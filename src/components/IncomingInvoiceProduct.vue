<template>
  <Card>
    <template #title>Gestione Prodotti</template> <!-- TODO da i18n -->
    <template #subtitle>Dati Prodotti Fattura</template> <!-- TODO da i18n -->

    <template #content>
      <!-- Box per inserimento o scan codice a barre -->
      <!-- Uso il div per centrare il box -->
      <div class="w-full flex items-center justify-center">
        <IncomingInvoiceProductForm :editable :incomingInvoiceId="id" @submit="onSubmit"></IncomingInvoiceProductForm>
      </div>

      <!-- Tabella con i prodotti inseriti -->
      {{model?.items}}

    </template>
  </Card>
</template>

<script setup lang="ts">

import Card from 'primevue/card'
import IncomingInvoiceProductForm
  from '@/components/forms/incomininvoice/IncomingInvoiceProductForm.vue'
import type { IncomingInvoiceProduct } from '@/types/incominInvoiceProduct.ts'
import type { IncomingInvoice } from '@/types/incomingInvoice.ts'

interface IncomingInvoiceProductProps {
  editable?: boolean
  id: number
}

const props = withDefaults(defineProps<IncomingInvoiceProductProps>(), {
  editable: false
})

const model = defineModel<IncomingInvoice>()

const onSubmit = (item: IncomingInvoiceProduct): void => {
  model.value?.items?.push(item)
}

</script>
