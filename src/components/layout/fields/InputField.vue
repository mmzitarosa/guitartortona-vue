<template>
    <FloatLabel variant="on">
      <slot />
      <label :for="inputId">{{ label }}</label>
    </FloatLabel>
</template>

<script setup lang="ts">

import { FloatLabel } from 'primevue'

interface InputFieldProps {
  inputId: string,
  label: string,
}

defineProps<InputFieldProps>()

</script>
