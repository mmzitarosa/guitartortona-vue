<template>
    <InputGroup>
      <InputField :inputId :label style="width: 1%; flex: 1 1 auto">
        <InputText
          v-model="model"
          :id="inputId"
          :class="filled ? 'p-filled' : ''"
          fluid
          :autofocus
          @keydown.enter="emit('search', model)"
          :readonly="loading"
        />
      </InputField>
      <Button :icon @click="emit('search', model)" :loading/>
    </InputGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, InputGroup, InputText } from 'primevue'
import InputField from '@/components/layout/fields/InputField.vue'

const emit = defineEmits(['search'])

interface InputTextFieldProps {
  inputId: string
  label: string
  readonly?: boolean
  filled?: boolean
  loading?: boolean
  validation?: { message?: string; valid: boolean }
  icon: string
  autofocus?: boolean
}

const props = defineProps<InputTextFieldProps>()

const model = ref<string>()

</script>
