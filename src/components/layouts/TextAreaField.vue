<template>
  <InputField :inputId :label :invalid :error="validation?.message">

    <Textarea v-model="model"
              :id="inputId"
              rows="2" auto-resize
              :readonly :invalid
              class="p-filled resize-none" fluid/>

  </InputField>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { Textarea } from 'primevue'
import InputField from '@/components/layouts/InputField.vue'

interface TextAreaFieldProps {
  inputId: string,
  label: string,
  readonly?: boolean;
  validation?: { message?: string, valid: boolean };
}

const props = defineProps<TextAreaFieldProps>()

const model = defineModel<string | undefined>()

//TODO qui si può pulire
const invalid = computed(() => !props.readonly && props.validation ? !props.validation.valid : false)

</script>
