import type { ButtonConst, CardConst, DialogConst, FieldConst } from '@/types/form'
import type { Menu } from '@/types/menu'

export const LAYOUT = {
  HEADER_SEARCH_LABEL: 'Cerca...',
  SIDEBAR_USER_PREFIX: 'Utente: '
}

export const LEDGER: {
  card: CardConst,
  date: FieldConst,
  invoiceNumber: FieldConst,
  invoiceDate: FieldConst,
  description: FieldConst,
  reason: FieldConst,
  bank: FieldConst,
  receiptNumber: FieldConst,
  amount: FieldConst,
  notes: FieldConst
  close: ButtonConst
  cancel: ButtonConst
  cancelDialog?: DialogConst
  reset?: ButtonConst
  resetDialog?: DialogConst
  save: ButtonConst
  saveDialog?: DialogConst
  update: ButtonConst,
  updateDialog?: DialogConst
  delete: ButtonConst,
  deleteDialog?: DialogConst
} = {
  card: {
    title: 'Nuovo Record',
    subtitle: 'Dati Record'
  },
  date: {
    label: 'Data',
    messages: {
      required: 'Seleziona una data',
      other: 'Data non valida'
    }
  }, invoiceNumber: {
    label: 'Numero Fattura',
    messages: {
      tooLong: 'Numero fattura troppo lungo'
    }
  }, invoiceDate: {
    label: 'Data Fattura',
    messages: {
      other: 'Data non valida'
    }
  },
  description: {
    label: 'Descrizione',
    messages: {
      required: 'Inserisci la descrizione',
      tooLong: 'Descrizione troppo lunga'
    }
  },
  reason: {
    label: 'Causale',
    messages: {
      tooLong: 'Causale troppo lunga'
    }
  },
  bank: {
    label: 'Banca',
    messages: {}
  },
  receiptNumber: {
    label: 'Ultime 3 Cifre a/b',
    messages: {
      tooLong: 'Valore troppo lungo'
    }
  },
  amount: {
    label: 'Importo',
    messages: {
      other: 'L\'importo deve essere positivo'
    }
  },
  notes: {
    label: 'Note',
    messages: {
      tooLong: 'Note troppo lunghe'
    }
  },
  close: {
    label: 'Chiudi',
    icon: 'pi pi-times'
  },
  cancel: {
    label: 'Annulla',
    icon: 'pi pi-times'
  },
  cancelDialog: {
    title: 'Annullare',
    message: 'Confermando i dati verranno ripristinati.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Annulla',
    rejectLabel: 'Chiudi',
    toastTitle: 'Annullato',
    toastMessage: 'Operazione annullata, i dati non sono stati modificati.'
  },
  reset: {
    label: 'Ripristina',
    icon: 'pi pi-undo'
  },
  resetDialog: {
    title: 'Ripristinare',
    message: 'Confermando i dati verranno ripristinati.',
    icon: 'pi pi-exclamation-circle',
    acceptLabel: 'Ripristina',
    rejectLabel: 'Chiudi',
    toastTitle: 'Ripristinato',
    toastMessage: 'I dati sono stati ripristinati correttamente.'
  },
  save: {
    label: 'Aggiungi',
    icon: 'pi pi-plus'
  },
  saveDialog: {
    title: 'Aggiungere',
    message: 'Confermando i dati verranno aggiunti.',
    icon: 'pi pi-info-circle',
    acceptLabel: 'Aggiungi',
    rejectLabel: 'Chiudi',
    toastTitle: 'Aggiunto',
    toastMessage: 'I dati sono stati aggiunti correttamente.'
  },
  update: {
    label: 'Aggiorna',
    icon: 'pi pi-sync'
  },
  updateDialog: {
    title: 'Aggiornare',
    message: 'Confermando i dati verranno aggiornati.',
    icon: 'pi pi-info-circle',
    acceptLabel: 'Aggiorna',
    rejectLabel: 'Chiudi',
    toastTitle: 'Aggiornato',
    toastMessage: 'I dati sono stati aggiornati correttamente.'
  },
  delete: {
    label: 'Elimina',
    icon: 'pi pi-trash'
  },
  deleteDialog:{
   title: 'Eliminare',
    message: 'Confermando i dati verranno eliminati.',
    icon: 'pi pi-times-circle',
    acceptLabel: 'Elimina',
    rejectLabel: 'Chiudi',
    toastTitle: 'Eliminato',
    toastMessage: 'I dati sono stati eliminati correttamente.'
  }
}

export const INCOMING_INVOICE: {
  card: CardConst
  supplier: FieldConst
  date: FieldConst
  number: FieldConst
  amount: FieldConst
  notes: FieldConst
  close: ButtonConst
  cancel: ButtonConst
  cancelDialog?: DialogConst
  reset?: ButtonConst
  resetDialog?: DialogConst
  save: ButtonConst
  saveDialog?: DialogConst
} = {
  card: {
    title: 'Nuova Fattura',
    subtitle: 'Dati Fattura'
  },
  supplier: {
    label: 'Fornitore',
    messages: {
      required: 'Seleziona o aggiungi un fornitore',
      tooLong: 'Nome del fornitore troppo lungo'
    }
  },
  date: {
    label: 'Data',
    messages: {
      required: 'Seleziona una data'
    }
  },
  number: {
    label: 'Numero Fattura',
    messages: {
      required: 'Inserisci il numero fattura',
      tooLong: 'Numero fattura troppo lungo'
    }
  },
  amount: {
    label: 'Importo',
    messages: {
      required: 'Inserisci l\'importo totale della fattura',
      other: 'L\'importo deve essere positivo'
    }
  },
  notes: {
    label: 'Note',
    messages: {
      tooLong: 'Note troppo lunghe'
    }
  },
  close: {
    label: 'Chiudi',
    icon: 'pi pi-times'
  },
  cancel: {
    label: 'Annulla',
    icon: 'pi pi-times'
  },
  cancelDialog: {
    title: 'Annullare',
    message: 'Confermarndo verranno annullati i dati inseriti.',
    icon: 'pi pi-times-circle',
    acceptLabel: 'Annulla',
    rejectLabel: 'Chiudi'
  },
  reset: {
    label: 'Ripristina',
    icon: 'pi pi-undo'
  },
  resetDialog: {
    title: 'Ripristinare',
    message: 'Confermarndo verranno ripristinati i dati inseriti.',
    icon: 'pi pi-exclamation-circle',
    acceptLabel: 'Ripristina',
    rejectLabel: 'Chiudi'
  },
  save: {
    label: 'Aggiungi',
    icon: 'pi pi-plus'
  },
  saveDialog: {
    title: 'Aggiungere',
    message: 'Confermarndo verranno aggiunti i dati inseriti.',
    icon: 'pi pi-plus-circle',
    acceptLabel: 'Aggiungi',
    rejectLabel: 'Chiudi'
  }
}

export const SIDEBAR_ITEMS: Menu[] = [
  {
    label: 'Fatture in Entrata',
    items: [
      { label: 'Inserisci Fattura', icon: 'pi pi-file-plus', route: '/incomingInvoice' },
      { label: 'Lista Fatture', icon: 'pi pi-list', route: '/incomingInvoices' }
    ]
  },
  {
    label: 'Usato',
    items: [
      { label: 'Nuova Ricevuta', icon: 'pi pi-plus', route: '/usedReceipt' },
      { label: 'Registro Usato', icon: 'pi pi-list', route: '/usedReceipts' }
    ]
  },
  {
    label: 'Prodotti',
    items: [
      { label: 'Inserisci Prodotto', icon: 'pi pi-plus', route: '/product' },
      { label: 'Ricerca Prodotto', icon: 'pi pi-search', route: '/product/search' },
      { label: 'Inventario', icon: 'pi pi-table', route: '/products' }
    ]
  },
  {
    label: 'Prima Nota',
    items: [
      { label: 'Inserisci Record', icon: 'pi pi-plus', route: '/ledgerEntry' },
      { label: 'Brogliaccio', icon: 'pi pi-table', route: '/ledger' }
    ]
  }
]
