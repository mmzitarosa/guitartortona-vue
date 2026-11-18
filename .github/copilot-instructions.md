# Istruzioni Copilot – guitartortona-vue

Rispondi e commenta in italiano; codice e nomi in inglese.

## Stack
Vue 3 (Composition API, `<script setup lang="ts">`), TypeScript, Vite, PrimeVue 4 (`@primeuix/themes`, `@primevue/forms`), Tailwind CSS 4 + tailwindcss-primeui, vue-router, axios, date-fns, VueUse. Lint: ESLint + Prettier.

## Struttura
`views/` pagine, `components/` UI riusabile, `composables/` logica e stato (`useXxx`), `services/api/` chiamate HTTP (via `apiClient`), `types/`, `utils/mapper/` conversioni DTO<->modello.

## Convenzioni
- Nessuna chiamata axios dentro i componenti: passare da `services/api` e composables.
- Tipizzare tutto, niente `any`; usare i type guard in `utils/typeGuards.ts`.
- Preferire componenti PrimeVue esistenti a HTML custom; stili con Tailwind, tema centralizzato.
- Verifica prima di consegnare: `npm run lint`, `npm run type-check`, `npm run build`.

## UX / UI
- Gestionale contabile: priorità a chiarezza, velocità di inserimento da tastiera e prevenzione errori.
- Ogni form: validazione inline, messaggi in italiano, stato loading/errore/vuoto, conferma per azioni distruttive.
- Importi: formattazione locale it-IT, allineati a destra; date con date-fns.
- Accessibilità WCAG AA: label associate, focus visibile, contrasto, navigazione da tastiera, `aria-*` dove serve.
- Responsive: usabile da tablet.

## Sicurezza
- Autenticazione tramite Keycloak (OIDC, Authorization Code + PKCE); token mai in `localStorage` se evitabile, mai loggati.
- Nessun segreto nel bundle: le variabili `VITE_*` sono pubbliche.
- Mai `v-html` con contenuti non sanificati. Validare input anche lato client, ma la verifica vera è sul backend.
- Route guard basate sui ruoli, ricordando che sono solo UX e non sicurezza.
