<template>
  <span>
    <slot />
    <Message v-show="invalid" severity="error" size="small" variant="simple">
      {{ error }}
    </Message>
  </span>
</template>

<script setup lang="ts">

import { Message } from 'primevue'

interface InputFieldProps {
  invalid?: boolean
  error?: string,
}

defineProps<InputFieldProps>()

</script>
