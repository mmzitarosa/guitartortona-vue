<script setup lang="ts">
import Header from './components/layout/Header.vue'
</script>

<template>
  <Header></Header>
  {{ API_CONFIG.environment }}
  <Button>Prova</Button>
</template>

<style scoped></style>
