<template>
  <IncomingInvoiceForm :editable="editable" :id></IncomingInvoiceForm>
</template>

<script setup lang="ts">
import IncomingInvoiceForm from '@/components/form/IncomingInvoiceForm.vue'
import { useRoute } from 'vue-router'

const  route = useRoute()

const id = Number(route.params.id);
const editable = route.query.editable === 'true';
</script>
