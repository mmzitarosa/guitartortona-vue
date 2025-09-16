import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import { ToastService } from 'primevue'
import KeyFilter from 'primevue/keyfilter'
import { createI18n } from 'vue-i18n'
import it from './locales/it.json'
import en from './locales/en.json'

const app = createApp(App)

const myPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ffe6e6',
      100: '#ffcccc',
      200: '#ff9999',
      300: '#ff6666',
      400: '#ff3333',
      500: '#cc3333',
      600: '#b22a2a',
      700: '#992222',
      800: '#7f1a1a',
      900: '#661111',
      950: '#330808',
    },
    surface: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
        surface: {
          background: '{surface.100}',
          card: '{surface.200}',
          border: '{surface.300}',
          hover: '{surface.400}',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
        surface: {
          background: '{surface.800}',
          card: '{surface.700}',
          border: '{surface.600}',
          hover: '{surface.500}',
        },
      },
    },
  },
})
const i18n = createI18n({
  legacy: false,
  locale: 'it',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: { it, en }
})

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: myPreset,
    options: {
      darkModeSelector: 'system',
    },
  },
  locale: {
    startsWith: 'Inizia con',
    contains: 'Contiene',
    notContains: 'Non contiene',
    endsWith: 'Finisce con',
    equals: 'Equivale',
    notEquals: 'Non uguale',
    noFilter: 'Senza Filtro',
    filter: 'Filtro',
    lt: 'Minore di',
    lte: 'Minore o uguale a',
    gt: 'Maggiore di',
    gte: 'Maggiore o uguale a',
    dateIs: 'La data è',
    dateIsNot: 'La data non è',
    dateBefore: 'La data è precedente',
    dateAfter: 'La data è successiva',
    custom: 'Personalizzato',
    clear: 'Cancella tutto',
    apply: 'Applica',
    matchAll: 'Abbina tutto',
    matchAny: 'Abbina alcuni',
    addRule: 'Aggiungi regola',
    removeRule: 'Rimuovi regola',
    accept: 'Si',
    reject: 'No',
    choose: 'Scegli',
    upload: 'Carica',
    cancel: 'Annulla',
    completed: 'Completato',
    pending: 'In corso',
    dayNames: ['Domenica', 'Lunedi', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
    monthNames: [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ],
    monthNamesShort: [
      'Gen',
      'Feb',
      'Mar',
      'Apr',
      'Mag',
      'Giu',
      'Lug',
      'Ago',
      'Set',
      'Ott',
      'Nov',
      'Dic',
    ],
    chooseYear: 'Seleziona Anno',
    chooseMonth: 'Seleziona Mese',
    chooseDate: 'Seleziona Data',
    prevDecade: 'Decade precedente',
    nextDecade: 'Decade successiva',
    prevYear: 'Anno precedente',
    nextYear: 'Anno successivo',
    prevMonth: 'Mese precedente',
    nextMonth: 'Mese successivo',
    prevHour: 'Ora precedente',
    nextHour: 'Ora successiva',
    prevMinute: 'Minuto precedente',
    nextMinute: 'Minuto successivo',
    prevSecond: 'Secondo precedente',
    nextSecond: 'Secondo successivo',
    am: 'AM',
    pm: 'PM',
    today: 'Oggi',
    weekHeader: 'Sett',
    firstDayOfWeek: 1,
    dateFormat: 'dd/mm/yy',
    weak: 'Debole',
    medium: 'Medio',
    strong: 'Forte',
    passwordPrompt: 'Inserisci la password',
    emptyFilterMessage: 'Nessuna opzione disponibile',
    searchMessage: '{0} risultati disponibili',
    selectionMessage: '{0} elementi selezionati',
    emptySelectionMessage: 'Nessun elemento selezionato',
    emptySearchMessage: 'Nessun risultato trovato',
    emptyMessage: 'Nessun risultato trovato',
    aria: {
      trueLabel: 'Vero',
      falseLabel: 'Falso',
      nullLabel: 'Non selezionato',
      firstPageLabel: 'Prima pagina',
      lastPageLabel: 'Ultima pagina',
      nextPageLabel: 'Pagina successiva',
      previousPageLabel: 'Pagina precedente',
      selectLabel: 'Seleziona',
      unselectLabel: 'Deseleziona',
      expandLabel: 'Espandi',
      collapseLabel: 'Riduci',
      star: '1 stella',
      stars: '{star} stelle',
      selectAll: 'Seleziona tutti gli elementi',
      unselectAll: 'Deseleziona tutti gli elementi',
      close: 'Chiudi',
      previous: 'Precedente',
      next: 'Successivo',
      navigation: 'Naviga',
      scrollTop: 'Torna sù',
      moveTop: 'Vai in cima',
      moveUp: 'Vai sopra',
      moveDown: 'Vai sotto',
      moveBottom: 'Vai in fondo',
      moveToTarget: "Vai all'elemento",
      moveToSource: 'Vai alla sorgente',
      moveAllToTarget: "Muovi tutto all'elemento",
      moveAllToSource: 'Muovi tutto alla sorgente',
      pageLabel: '{page}',
      rowsPerPageLabel: 'Elementi per pagina',
      jumpToPageDropdownLabel: 'Vai alla Dropdown delle pagine',
      jumpToPageInputLabel: "Vai all'Input delle pagine",
      selectRow: 'Seleziona riga',
      unselectRow: 'Deseleziona riga',
      expandRow: 'Espandi riga',
      collapseRow: 'Riduci riga',
      showFilterMenu: 'Mostra Menu filtri',
      hideFilterMenu: 'Nascondi Menu filtri',
      filterOperator: 'Operatore di filtro',
      filterConstraint: 'Costante di filtro',
      editRow: 'Modifica riga',
      saveEdit: 'Salva modifica',
      cancelEdit: 'Annulla modifica',
      listView: 'Lista',
      gridView: 'Griglia',
      slide: 'Scorri',
      slideNumber: '{slideNumber}',
      zoomImage: 'Zoom Immagine',
      zoomIn: 'Ingrandisci',
      zoomOut: 'Riduci',
      rotateRight: 'Ruota a destra',
      rotateLeft: 'Ruota a sinistra',
    },
  },
})

app.use(ConfirmationService)
app.use(ToastService)

app.use(i18n)

app.directive('keyfilter', KeyFilter);

app.mount('#app')
