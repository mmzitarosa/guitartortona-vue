import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

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

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: myPreset,
    options: {
      darkModeSelector: 'system',
    },
  },
})
app.mount('#app')
