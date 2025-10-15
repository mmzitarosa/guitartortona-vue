<template>
    <FloatLabel variant="on" :class>
      <slot />
      <label :for="inputId">{{ label }}</label>
    </FloatLabel>
</template>

<script setup lang="ts">

import { FloatLabel } from 'primevue'

interface InputFieldProps {
  inputId: string,
  label: string,
  class?: string
}

defineProps<InputFieldProps>()

</script>
