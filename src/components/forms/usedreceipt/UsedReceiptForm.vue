<template>
  <Card>
    <template #title>
      <div class="flex flex-wrap items-start justify-between gap-2">
        <span>{{ constants.card.title }}</span>
        <Button
          v-if="model.ledgerEntryId && canEdit"
          type="button"
          size="small"
          text
          icon="pi pi-book"
          :label="constants.ledgerAlignment.openLedger"
          @click="emit('openLedger')"
        />
      </div>
    </template>
    <template #subtitle>{{ constants.card.subtitle }}</template>
    <template #content>
      <ProgressBar
        :mode="loading ? 'indeterminate' : 'determinate'"
        class="mt-2 max-h-[1px]"
      ></ProgressBar>

      <Message v-if="model.archived" severity="warn" icon="pi pi-trash" class="mt-4">
        {{ constants.archived.message }}
      </Message>

      <!-- Ricevuta registrata: riga di brogliaccio collegata e differenze da gestire (solo admin) -->
      <Message
        v-if="model.ledgerAlignment"
        severity="warn"
        icon="pi pi-exclamation-triangle"
        class="mt-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span>{{ constants.ledgerAlignment.notice[model.ledgerAlignment.action] }}</span>
          <Button
            type="button"
            link
            class="!p-0 underline"
            :label="constants.ledgerAlignment.review"
            @click="emit('reviewLedger')"
          />
        </div>
      </Message>

      <div class="grid gap-4 w-full mt-6">
        <!-- Prima riga: codice interno -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <span class="hidden md:block"></span>

          <InputTextField
            v-model="model.internalCode"
            inputId="internalCode"
            placeholder="AUTO"
            :label="constants.internalCode.label"
            readonly
          />
        </div>

        <!-- Seconda riga: cliente e data -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <div class="flex gap-2 items-start">
            <div class="flex-1">
              <SelectField
                v-model="customerModel"
                inputId="customer"
                :label="constants.customer.label"
                :loading="customersLoading"
                :options="customerOptions"
                optionLabel="fullName"
                :optionDetail="(customer: CustomerOption) => customer.city"
                showClear
                :readonly
              />
            </div>
            <template v-if="!readonly">
              <Button
                v-if="model.customer"
                type="button"
                severity="secondary"
                outlined
                icon="pi pi-pencil"
                :aria-label="constants.customer.editLabel"
                v-tooltip.top="constants.customer.editLabel"
                @click="openCustomerDialog(true)"
              />
              <Button
                type="button"
                severity="secondary"
                outlined
                icon="pi pi-plus"
                :aria-label="constants.customer.newLabel"
                v-tooltip.top="constants.customer.newLabel"
                @click="openCustomerDialog(false)"
              />
            </template>
          </div>

          <InputDateField
            v-model="model.date"
            inputId="date"
            :label="constants.date.label"
            :readonly
            :minDate="frozenYear ? new Date(frozenYear, 0, 1) : undefined"
            :maxDate="frozenYear ? new Date(frozenYear, 11, 31) : undefined"
            :validation="validation.fields.date"
          />
        </div>

        <!-- Terza riga: numero e importo, assegnati dal sistema -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <InputTextField
            v-model="model.number"
            inputId="number"
            placeholder="AUTO"
            :label="constants.number.label"
            readonly
          />

          <InputAmountField
            v-model="model.amount"
            inputId="amount"
            placeholder="AUTO"
            :label="constants.amount.label"
            readonly
          />
        </div>

        <!-- Quarta riga: note -->
        <div class="col-span-full">
          <TextAreaField
            v-model="model.notes"
            inputId="notes"
            :label="constants.notes.label"
            :readonly
            :validation="validation.fields.notes"
          >
          </TextAreaField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full mt-2">
        <!-- Bottoni di sinistra -->
        <div class="flex gap-2">
          <!-- Bottone Chiudi - Visualizzazione/Modifica senza cambiamenti-->
          <Button
            v-if="backable && existingItem && pristine"
            type="button"
            severity="secondary"
            :label="constants.close.label"
            :icon="constants.close.icon"
            @click="emit('close')"
          />
          <!-- Tasto Annulla - Inserimento/Modifica con cambiamenti -->
          <Button
            v-else-if="backable"
            type="button"
            severity="secondary"
            :label="constants.cancel.label"
            :icon="constants.cancel.icon"
            @click="emit('close')"
          />

          <!-- Tasto Reset - Inserimento/Modifica con cambiamenti  -->
          <Button
            type="button"
            v-if="dirty"
            :icon="constants.reset?.icon"
            severity="secondary"
            variant="text"
            rounded
            aria-label="Filter"
            @click="emit('reset')"
          />
        </div>

        <!-- Bottoni di destra -->
        <div class="flex flex-wrap justify-end gap-2">
          <!-- Tasto Elimina (archivia) - Visualizzazione e modifica, secondo stato e ruolo -->
          <Button
            v-if="existingItem && permissions.archive"
            type="button"
            rounded
            text
            icon="pi pi-trash"
            severity="secondary"
            @click="emit('archive')"
          />

          <!-- Ricevuta eliminata: solo admin, ripristino ed eliminazione definitiva -->
          <Button
            v-if="permissions.hardDelete"
            type="button"
            text
            severity="danger"
            :label="constants.hardDelete.label"
            icon="pi pi-times-circle"
            @click="emit('hardDelete')"
          />
          <Button
            v-if="permissions.restore"
            type="button"
            outlined
            :label="constants.restore.label"
            icon="pi pi-replay"
            @click="emit('restore')"
          />

          <!-- Tasto Edit - Visualizzazione  -->
          <Button
            v-if="readonly && existingItem && permissions.edit"
            type="button"
            rounded
            text
            icon="pi pi-pen-to-square"
            severity="secondary"
            @click="emit('edit')"
          />

          <!-- Tasto Stampa - dalla conferma in poi -->
          <Button
            v-if="existingItem && permissions.print && !dirty"
            type="button"
            rounded
            text
            icon="pi pi-print"
            severity="secondary"
            :aria-label="constants.print.receipt"
            v-tooltip.top="constants.print.receipt"
            @click="printDialog = true"
          />

          <!-- Tasto Aggiungi - Inserimento  -->
          <Button
            v-if="!readonly && !existingItem"
            type="button"
            :label="constants.save.label"
            :icon="constants.save.icon"
            @click="emit('submit')"
          />

          <!-- Tasto Aggiorna - Modifica con cambiamenti   -->
          <Button
            v-else-if="!readonly && dirty"
            type="button"
            :label="constants.update.label"
            :icon="constants.update.icon"
            @click="emit('submit')"
          />

          <!-- Bozza: Conferma (passa in attesa di registrazione) -->
          <Button
            v-else-if="permissions.confirm"
            type="button"
            outlined
            :disabled="!model.items?.length"
            :label="constants.confirm.label"
            icon="pi pi-check"
            @click="emit('complete')"
          />

          <!-- Confermata: Registra (assegna numero) -->
          <Button
            v-else-if="permissions.register"
            type="button"
            outlined
            :label="constants.register.label"
            icon="pi pi-check"
            @click="emit('register')"
          />
        </div>
      </div>
    </template>
  </Card>
  <ChangesDialog :changes></ChangesDialog>

  <UsedReceiptPrintDialog v-if="model.id" v-model:visible="printDialog" :receiptId="model.id" />

  <CustomerDialog
    v-model:visible="customerDialog"
    :customer="customerDialogEditing ? model.customer : undefined"
    @save="onCustomerSave"
  />
</template>

<script setup lang="ts">
import { useRoles } from '@/composables/useRoles'
import { computed, onMounted, ref, watch } from 'vue'
import Card from 'primevue/card'
import { Button, Message, ProgressBar } from 'primevue'
import type { UsedReceipt } from '@/types/usedReceipt'
import { type CustomerOption, type Customer, toCustomerDTO, withFullName } from '@/types/customer'
import ChangesDialog from '@/components/layout/ChangesDialog.vue'
import InputDateField from '@/components/layout/fields/InputDateField.vue'
import InputAmountField from '@/components/layout/fields/InputAmountField.vue'
import TextAreaField from '@/components/layout/fields/TextAreaField.vue'
import InputTextField from '@/components/layout/fields/InputTextField.vue'
import SelectField from '@/components/layout/fields/SelectField.vue'
import UsedReceiptPrintDialog from '@/components/forms/usedreceipt/UsedReceiptPrintDialog.vue'
import CustomerDialog from '@/components/forms/usedreceipt/CustomerDialog.vue'
import { useCustomers } from '@/composables/useCustomers'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useUsedReceiptConstants } from '@/utils/i18nConstants'

const constants = useUsedReceiptConstants()

interface UsedReceiptFormProps {
  editable?: boolean
  backable?: boolean
  loading?: boolean
  validation: {
    fields: Record<string, { message?: string; valid: boolean }>
    valid: boolean
  }
  changes: Array<{ field: string; oldValue: unknown; newValue: unknown; ignore: boolean }>
  dirty: boolean
  pristine: boolean
  existingItem: boolean
}

const props = withDefaults(defineProps<UsedReceiptFormProps>(), {
  editable: false,
  backable: true,
  loading: false,
})

const { receiptPermissions, canEdit } = useRoles()
const confirmDialog = useConfirmDialog()

const emit = defineEmits<{
  submit: []
  complete: []
  register: []
  close: []
  edit: []
  archive: []
  restore: []
  hardDelete: []
  reset: []
  reviewLedger: []
  openLedger: []
}>()
const model = defineModel<UsedReceipt>({ required: true })

const { options: customerOptions, loading: customersLoading, loadCustomers } = useCustomers()

const permissions = computed(() => receiptPermissions(model.value))

// Anno e numero nascono alla registrazione ("n/aa"): la data si può cambiare solo dentro quell'anno
const frozenYear = computed(() => {
  const suffix = model.value.number?.split('/')[1]
  return suffix ? 2000 + Number(suffix) : undefined
})

const readonly = computed(() => !props.editable || (props.existingItem && !permissions.value.edit))

// Il cliente è una copia dei dati sulla ricevuta; scegliere dall'anagrafica non la modifica
const customerModel = computed({
  get: (): CustomerOption | undefined => {
    const customer = model.value.customer
    if (!customer) return undefined
    // Serve l'istanza tra le opzioni, altrimenti la select non riconosce il valore scelto
    const option = customerOptions.value.find(
      (o) => o.id === customer.id && sameCustomer(o, customer),
    )
    return option ?? withFullName(customer)
  },
  set: (customer?: CustomerOption | Customer) => {
    model.value.customer = customer ? toCustomerDTO(customer) : undefined
    model.value.updateCustomer = false
  },
})

const printDialog = ref(false)
const customerDialog = ref(false)
const customerDialogEditing = ref(false)

const openCustomerDialog = (editing: boolean) => {
  customerDialogEditing.value = editing
  customerDialog.value = true
}

const sameCustomer = (a?: Customer, b?: Customer) =>
  JSON.stringify(a && toCustomerDTO(a)) === JSON.stringify(b && toCustomerDTO(b))

const onCustomerSave = async (customer: Customer) => {
  const previous = customerDialogEditing.value ? model.value.customer : undefined
  // Nuovo cliente: nessun id, verrà creato in anagrafica al salvataggio
  const saved = customerDialogEditing.value
    ? { ...customer, id: previous?.id }
    : { ...customer, id: undefined }
  model.value.customer = toCustomerDTO(saved)
  model.value.updateCustomer = false

  if (saved.id && !sameCustomer(previous, saved)) {
    const update = await confirmDialog.require<boolean>({
      header: constants.propagate.title,
      message: constants.propagate.message,
      icon: 'pi pi-question-circle',
      acceptLabel: constants.propagate.acceptLabel,
      rejectLabel: constants.propagate.rejectLabel,
      accept: async () => true,
    })
    model.value.updateCustomer = !!update
  }
}

// Un cliente appena creato compare tra le opzioni solo dopo il salvataggio della ricevuta
watch(
  () => model.value.customer?.id,
  (id) => {
    if (id && !customerOptions.value.some((customer) => customer.id === id)) loadCustomers()
  },
)

onMounted(loadCustomers)
</script>
