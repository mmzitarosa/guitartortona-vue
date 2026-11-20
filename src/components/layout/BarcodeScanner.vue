<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="t('barcode.title')"
    :style="{ width: '28rem', maxWidth: '95vw' }"
    @show="startScan"
    @hide="stopScan"
  >
    <div class="flex flex-col gap-3">
      <video
        ref="videoEl"
        class="w-full rounded bg-black aspect-[4/3] object-cover"
        muted
        playsinline
      />
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <p v-else class="text-sm text-gray-500 m-0">{{ t('barcode.hint') }}</p>
      <Button
        v-if="error"
        type="button"
        icon="pi pi-refresh"
        :label="t('barcode.retry')"
        @click="startScan"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Dialog, Message } from 'primevue'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { getProductDetailByCode } from '@/services/api/productService'

const emit = defineEmits<{ found: [productId: number] }>()

const { t } = useI18n()
const visible = defineModel<boolean>({ default: false })
const videoEl = ref<HTMLVideoElement>()
const error = ref('')

let controls: IScannerControls | undefined
let handling = false

const stopScan = (): void => {
  controls?.stop()
  controls = undefined
  const stream = videoEl.value?.srcObject as MediaStream | null
  stream?.getTracks().forEach((track) => track.stop())
  if (videoEl.value) videoEl.value.srcObject = null
}

const onDetected = async (code: string): Promise<void> => {
  if (handling) return
  handling = true
  try {
    const product = await getProductDetailByCode(code)
    if (product.id) {
      stopScan()
      visible.value = false
      emit('found', product.id)
      return
    }
    error.value = t('barcode.notFound', { code })
  } catch {
    error.value = t('barcode.notFound', { code })
  }
  stopScan()
  handling = false
}

const startScan = async (): Promise<void> => {
  error.value = ''
  handling = false
  stopScan()
  if (!videoEl.value) return
  try {
    controls = await new BrowserMultiFormatReader().decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } } },
      videoEl.value,
      (result) => {
        if (result) void onDetected(result.getText())
      },
    )
  } catch (e) {
    const name = (e as DOMException).name
    error.value =
      name === 'NotAllowedError' || name === 'SecurityError'
        ? t('barcode.permissionDenied')
        : t('barcode.cameraError')
  }
}
</script>
