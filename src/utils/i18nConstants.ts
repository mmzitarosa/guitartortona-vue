import type { paymentMethods } from '@/types/ledgerEntry'
import type { Menu } from '@/types/menu'
import { useI18n } from 'vue-i18n'

/**
 * Layout constants using i18n
 */
export const useLayoutConstants = () => {
  const { t } = useI18n()

  return {
    search: t('layout.header.searchLabel'),
    userPrefix: t('layout.sidebar.userPrefix'),
    dateFormat: t('common.placeholders.dateFormat'),
  }
}

/**
 * Ledger table constants using i18n
 */
export const useLedgerTableConstants = () => {
  const { t } = useI18n()

  return {
    fromDate: {
      label: t('filters.fromDate.label'),
      messages: {
        required: t('common.messages.dateRequired'),
        invalid: t('common.messages.dateInvalid'),
      },
    },
    toDate: {
      label: t('filters.toDate.label'),
      messages: {
        required: t('common.messages.dateRequired'),
        invalid: t('common.messages.dateInvalid'),
      },
    },
    reset: {
      icon: t('buttons.reset.icon'),
    },
    print: {
      icon: t('buttons.print.icon'),
    },
    search: {
      icon: t('buttons.search.icon'),
    },
  }
}

/**
 * Ledger constants using i18n
 */
export const useLedgerEntryConstants = () => {
  const { t } = useI18n()

  return {
    card: {
      title: t('cards.newRecord.title'),
      subtitle: t('cards.newRecord.subtitle'),
    },
    date: {
      label: t('common.labels.date'),
      messages: {
        required: t('common.messages.dateRequired'),
        invalid: t('common.messages.dateInvalid'),
      },
    },
    invoiceNumber: {
      label: t('common.labels.invoiceNumber'),
      messages: {
        tooLong: t('common.messages.invoiceNumberTooLong'),
      },
    },
    invoiceDate: {
      label: t('common.labels.invoiceDate'),
      messages: {
        invalid: t('common.messages.dateInvalid'),
      },
    },
    description: {
      label: t('common.labels.description'),
      messages: {
        required: t('common.messages.descriptionRequired'),
        tooLong: t('common.messages.descriptionTooLong'),
      },
    },
    reason: {
      label: t('common.labels.reason'),
      messages: {
        tooLong: t('common.messages.reasonTooLong'),
      },
    },
    paymentType: {
      label: t('common.labels.paymentType'),
    },
    receiptNumber: {
      label: t('common.labels.receiptNumber'),
      messages: {
        tooLong: t('common.messages.receiptNumberTooLong'),
      },
    },
    paymentMethod: {
      label: t('common.labels.paymentMethod'),
    },
    bank: {
      label: t('common.labels.bank'),
      messages: {
        required: t('common.messages.bankRequired'),
      },
    },
    movementType: {
      label: t('common.labels.movementType'),
    },
    amount: {
      label: t('common.labels.amount'),
      messages: {
        required: t('common.messages.amountRequired'),
        invalid: t('common.messages.amountInvalid'),
      },
    },
    notes: {
      label: t('common.labels.notes'),
      messages: {
        tooLong: t('common.messages.notesTooLong'),
      },
    },
    close: {
      label: t('buttons.close.label'),
      icon: t('buttons.close.icon'),
    },
    cancel: {
      label: t('buttons.cancel.label'),
      icon: t('buttons.cancel.icon'),
    },
    reset: {
      label: t('buttons.reset.label'),
      icon: t('buttons.reset.icon'),
    },
    save: {
      label: t('buttons.save.label'),
      icon: t('buttons.save.icon'),
    },
    update: {
      label: t('buttons.update.label'),
      icon: t('buttons.update.icon'),
    },
    delete: {
      label: t('buttons.delete.label'),
      icon: t('buttons.delete.icon'),
    },
  }
}

/**
 * Incoming invoice constants using i18n
 */
export const useIncomingInvoiceConstants = () => {
  const { t } = useI18n()

  return {
    card: {
      title: t('cards.newInvoice.title'),
      subtitle: t('cards.newInvoice.subtitle'),
    },
    supplier: {
      label: t('common.labels.supplier'),
      messages: {
        required: t('common.messages.supplierRequired'),
        tooLong: t('common.messages.supplierTooLong'),
      },
    },
    date: {
      label: t('common.labels.invoiceDate'),
      messages: {
        required: t('common.messages.dateRequired'),
        invalid: t('common.messages.dateInvalid'),
      },
    },
    number: {
      label: t('common.labels.invoiceNumber'),
      messages: {
        required: t('common.messages.invoiceNumberRequired'),
        tooLong: t('common.messages.invoiceNumberTooLong'),
      },
    },
    amount: {
      label: t('common.labels.amount'),
      messages: {
        required: t('common.messages.amountTotalRequired'),
        invalid: t('common.messages.amountInvalid'),
      },
    },
    notes: {
      label: t('common.labels.notes'),
      messages: {
        tooLong: t('common.messages.notesTooLong'),
      },
    },
    close: {
      label: t('buttons.close.label'),
      icon: t('buttons.close.icon'),
    },
    cancel: {
      label: t('buttons.cancel.label'),
      icon: t('buttons.cancel.icon'),
    },
    reset: {
      label: t('buttons.reset.label'),
      icon: t('buttons.reset.icon'),
    },
    save: {
      label: t('buttons.save.label'),
      icon: t('buttons.save.icon'),
    },
    update: {
      label: t('buttons.update.label'),
      icon: t('buttons.update.icon'),
    },
    delete: {
      label: t('buttons.delete.label'),
      icon: t('buttons.delete.icon'),
    },
  }
}

export const useConfirmDialogConstants = () => {
  const { t } = useI18n()

  return {
    cancelDialog: {
      title: t('dialogs.cancel.title'),
      message: t('dialogs.cancel.message'),
      icon: t('dialogs.cancel.icon'),
      acceptLabel: t('dialogs.cancel.acceptLabel'),
      rejectLabel: t('dialogs.cancel.rejectLabel'),
      toastTitle: t('dialogs.cancel.toastTitle'),
      toastMessage: t('dialogs.cancel.toastMessage'),
    },
    resetDialog: {
      title: t('dialogs.reset.title'),
      message: t('dialogs.reset.message'),
      icon: t('dialogs.reset.icon'),
      acceptLabel: t('dialogs.reset.acceptLabel'),
      rejectLabel: t('dialogs.reset.rejectLabel'),
      toastTitle: t('dialogs.reset.toastTitle'),
      toastMessage: t('dialogs.reset.toastMessage'),
    },
    saveDialog: {
      title: t('dialogs.save.title'),
      message: t('dialogs.save.message'),
      icon: t('dialogs.save.icon'),
      acceptLabel: t('dialogs.save.acceptLabel'),
      rejectLabel: t('dialogs.save.rejectLabel'),
      toastTitle: t('dialogs.save.toastTitle'),
      toastMessage: t('dialogs.save.toastMessage'),
    },
    updateDialog: {
      title: t('dialogs.update.title'),
      message: t('dialogs.update.message'),
      icon: t('dialogs.update.icon'),
      acceptLabel: t('dialogs.update.acceptLabel'),
      rejectLabel: t('dialogs.update.rejectLabel'),
      toastTitle: t('dialogs.update.toastTitle'),
      toastMessage: t('dialogs.update.toastMessage'),
    },
    deleteDialog: {
      title: t('dialogs.delete.title'),
      message: t('dialogs.delete.message'),
      icon: t('dialogs.delete.icon'),
      acceptLabel: t('dialogs.delete.acceptLabel'),
      rejectLabel: t('dialogs.delete.rejectLabel'),
      toastTitle: t('dialogs.delete.toastTitle'),
      toastMessage: t('dialogs.delete.toastMessage'),
    },
  }
}

/**
 * Sidebar items using i18n
 */
export const useSidebarItems = (): Menu[] => {
  const { t } = useI18n()

  return [
    {
      label: t('navigation.sections.incomingInvoices'),
      items: [
        {
          label: t('navigation.items.insertInvoice'),
          icon: 'pi pi-file-plus',
          route: '/incomingInvoice',
        },
        {
          label: t('navigation.items.invoiceList'),
          icon: 'pi pi-list',
          route: '/incomingInvoices',
          disabled: true,
        },
      ],
    },
    {
      label: t('navigation.sections.used'),
      items: [
        {
          label: t('navigation.items.newReceipt'),
          icon: 'pi pi-plus',
          route: '/usedReceipt',
          disabled: true,
        },
        {
          label: t('navigation.items.usedRegister'),
          icon: 'pi pi-list',
          route: '/usedReceipts',
          disabled: true,
        },
      ],
    },
    {
      label: t('navigation.sections.products'),
      items: [
        {
          label: t('navigation.items.insertProduct'),
          icon: 'pi pi-plus',
          route: '/product',
          disabled: true,
        },
        {
          label: t('navigation.items.searchProduct'),
          icon: 'pi pi-search',
          route: '/product/search',
          disabled: true,
        },
        {
          label: t('navigation.items.inventory'),
          icon: 'pi pi-table',
          route: '/products',
          disabled: true,
        },
      ],
    },
    {
      label: t('navigation.sections.ledger'),
      items: [
        {
          label: t('navigation.items.insertRecord'),
          icon: 'pi pi-plus',
          route: '/ledgerEntry',
        },
        {
          label: t('navigation.items.ledger'),
          icon: 'pi pi-table',
          route: '/ledger',
        },
      ],
    },
  ]
}
