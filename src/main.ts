import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import { ToastService, Tooltip } from 'primevue'
import KeyFilter from 'primevue/keyfilter'

import { customThemePreset, italianLocale } from '@/config/theme.config'
import { i18n } from '@/config/i18n.config'

const app = createApp(App)

// Configure PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: customThemePreset,
    options: {
      darkModeSelector: 'system',
    },
  },
  locale: italianLocale,
})

// Configure services
app.use(ConfirmationService)
app.use(ToastService)

// Configure router
app.use(router)

// Configure i18n
app.use(i18n)

// Configure directives
app.directive('keyfilter', KeyFilter)
app.directive('tooltip', Tooltip);

// Mount the app
app.mount('#app')
