<script setup lang="ts">
import { API_CONFIG } from '@/config/api'

</script>

<template>
  <h1>You did it!</h1>
  <h2>Environment: {{ API_CONFIG.environment }}</h2>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
