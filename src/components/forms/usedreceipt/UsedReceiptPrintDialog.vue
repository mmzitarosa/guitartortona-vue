<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="constants.title"
    class="w-full max-w-2xl mx-4"
    :pt="{ content: { class: 'pb-0' } }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex justify-center">
        <SelectButton
          v-model="mode"
          :options="options"
          optionLabel="label"
          optionValue="value"
          :allowEmpty="false"
        />
      </div>

      <ProgressBar v-if="loading" mode="indeterminate" class="max-h-[1px]" />

      <!-- L'anteprima è scalata alla larghezza disponibile, così da rendere l'idea del foglio stampato -->
      <div ref="container" class="w-full max-h-[45vh] overflow-y-auto overflow-x-hidden">
        <div
          v-if="url"
          class="mx-auto overflow-hidden bg-white p-2 border border-surface-200 shadow-sm"
          :style="{ boxSizing: 'content-box', width: `${Math.ceil(docWidth * scale)}px`, height: `${Math.ceil(docHeight * scale)}px` }"
        >
          <iframe
            ref="frame"
            :src="url"
            :title="constants.title"
            :width="docWidth"
            :height="docHeight"
            class="block border-0"
            :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
            @load="measure"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        type="button"
        severity="secondary"
        :label="close.label"
        :icon="close.icon"
        @click="visible = false"
      />
      <Button
        type="button"
        :icon="print.icon"
        :label="mode === 'receipt' ? constants.printReceipt : constants.printLabels"
        :disabled="!url"
        @click="printFrame"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button, Dialog, ProgressBar, SelectButton } from 'primevue'
import { usedReceiptPrintUrl, type UsedReceiptPrintMode } from '@/services/api/usedReceiptService'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'
import { useProductPrintConstants } from '@/utils/i18nConstants'
import { useErrorHandler } from '@/utils/errorHandler'

const props = defineProps<{ receiptId: number }>()
const visible = defineModel<boolean>('visible', { required: true })

const { print: constants, close } = useUsedReceiptConstants()
const { print } = useProductPrintConstants()
const { handleApiError } = useErrorHandler()

const mode = ref<UsedReceiptPrintMode>('receipt')
const options = computed(() => [
  { label: constants.receiptOption, value: 'receipt' },
  { label: constants.labelsOption, value: 'labels' },
])

const url = ref<string>()
const loading = ref(false)
const frame = ref<HTMLIFrameElement>()
const container = ref<HTMLDivElement>()

// Larghezza del documento in px: due A4 affiancati a 96 dpi per la ricevuta, larghezza dell'etichetta per le etichette
const docWidth = computed(() => (mode.value === 'receipt' ? 1588 : 587))
const docHeight = ref(0)
const containerWidth = ref(0)
// Padding (8px) e bordo (1px) per lato attorno all'anteprima
const FRAME_EXTRA = 18
const viewportHeight = ref(window.innerHeight)
// Altezza di una pagina del documento: l'anteprima non deve superare circa metà schermo
const pageHeight = computed(() => (mode.value === 'receipt' ? 1123 : 240))
const scale = computed(() =>
  Math.min(
    mode.value === 'receipt' ? 1 : 0.6,
    containerWidth.value ? (containerWidth.value - FRAME_EXTRA) / docWidth.value : 1,
    (viewportHeight.value * 0.42 - FRAME_EXTRA) / pageHeight.value,
  ),
)
const onResize = () => (viewportHeight.value = window.innerHeight)

// Ricevuta: tutta la pagina; etichette: solo l'area occupata dalle etichette, escluso lo sfondo della pagina
const contentHeight = (doc: Document) => {
  const labels = doc.querySelectorAll('.label')
  if (mode.value === 'receipt' || !labels.length) return doc.documentElement.scrollHeight
  return Math.ceil(labels[labels.length - 1].getBoundingClientRect().bottom + doc.defaultView!.scrollY)
}

const measure = () => {
  const doc = frame.value?.contentDocument
  if (!doc) return
  docHeight.value = contentHeight(doc)
  doc.fonts?.ready.then(() => (docHeight.value = contentHeight(doc)))
}

let observer: ResizeObserver | undefined
onMounted(() => {
  window.addEventListener('resize', onResize)
  observer = new ResizeObserver(([entry]) => (containerWidth.value = entry.contentRect.width))
})
watch(container, (el, previous) => {
  if (previous) observer?.unobserve(previous)
  if (el) observer?.observe(el)
})

const releaseUrl = () => {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = undefined
}

// L'anteprima è scaricata con il token e mostrata tramite Blob URL: stessa origine, quindi stampabile
const load = async () => {
  releaseUrl()
  docHeight.value = 0
  loading.value = true
  const requested = mode.value
  try {
    const documentUrl = await usedReceiptPrintUrl(props.receiptId, requested)
    if (visible.value && requested === mode.value) url.value = documentUrl
    else URL.revokeObjectURL(documentUrl)
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const printFrame = () => {
  frame.value?.contentWindow?.focus()
  frame.value?.contentWindow?.print()
}

watch(
  () => [visible.value, mode.value],
  () => (visible.value ? load() : releaseUrl()),
)

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', onResize)
  releaseUrl()
})
</script>
