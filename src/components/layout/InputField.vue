<template xmlns="http://www.w3.org/1999/html">
  <span>
  <FloatLabel variant="on">
    <slot />
    <label :for="inputId">{{ label }}</label>
  </FloatLabel>
  <Message v-show="invalid" severity="error" size="small" variant="simple">
    {{ error }}
  </Message>
    </span>
</template>

<script setup lang="ts">

import { FloatLabel, Message } from 'primevue'

interface InputFieldProps {
  inputId: string,
  label: string,
  invalid?: boolean
  error?: string,
}

const props = defineProps<InputFieldProps>()

</script>
