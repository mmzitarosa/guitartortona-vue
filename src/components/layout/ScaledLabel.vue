<template>
  <div class="container" ref="containerRef">
    <!-- Wrapper che definisce lo spazio effettivo -->
    <div
      class="scaled-wrapper"
      :style="{
        width: scaledWidth + 'px',
        height: scaledHeight + 'px',
      }"
    >
      <!-- Iframe in absolute per non influenzare il layout -->
      <div class="iframe-container">
        <iframe
          :src="props.labelUrl"
          :width="props.width"
          :height="props.height"
          :style="{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }"
          frameborder="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Props {
  labelUrl: string
  width: number
  height: number
  maxWidth?: number
}

const props = defineProps<Props>()

const containerRef = ref<HTMLDivElement | null>(null)

const maxScale = computed(() => {
  if (!props.maxWidth || props.maxWidth > props.width) return 1
  return props.maxWidth / props.width
})

const scale = ref<number>(maxScale.value)

const scaledWidth = computed((): number => props.width * scale.value)
const scaledHeight = computed((): number => props.height * scale.value)

const updateScale = (): void => {
  // Resetta temporaneamente per misurare lo spazio reale
  scale.value = 0.01

  nextTick(() => {
    if (containerRef.value) {
      const containerWidth = containerRef.value.offsetWidth
      scale.value = Math.min(maxScale.value, containerWidth / props.width)
    }
  })
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<style scoped>
.container {
  width: 100%;
  overflow: hidden;
}

.scaled-wrapper {
  position: relative;
  overflow: hidden;
  margin: auto;
}

.iframe-container {
  position: absolute;
  top: 0;
  left: 0;
}

.iframe-container iframe {
  display: block;
  border: none;
}
</style>
