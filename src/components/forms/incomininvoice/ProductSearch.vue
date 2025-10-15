<template>
    <InputGroupTextField
      input-id="barcode"
      :label
      icon="pi pi-search"
      filled autofocus
      @search="value => emit('search', value)"
    /> <!-- TODO da i18n -->
</template>

<script setup lang="ts">
import InputGroupTextField from '@/components/layout/fields/InputGroupTextField.vue'

interface ProductSearchProps {
  label: string
}

const props = defineProps<ProductSearchProps>();

const emit = defineEmits(['search'])




</script>
