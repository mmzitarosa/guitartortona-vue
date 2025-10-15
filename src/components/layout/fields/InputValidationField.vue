<template xmlns="http://www.w3.org/1999/html">
  <ValidationField :invalid :error>
    <InputField :inputId :label :class>
      <slot />
    </InputField>
  </ValidationField>
</template>

<script setup lang="ts">

import InputField from '@/components/layout/fields/InputField.vue'
import ValidationField from '@/components/layout/fields/ValidationField.vue'

interface InputFieldProps {
  inputId: string,
  label: string,
  invalid?: boolean
  error?: string,
  class?: string,
}

defineProps<InputFieldProps>()

</script>
