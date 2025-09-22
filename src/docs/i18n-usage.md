# Guida all'uso di i18n nel progetto Vue Guitar

## Panoramica

Il progetto è stato aggiornato per utilizzare Vue i18n invece delle costanti hardcoded. Questo permette di supportare più lingue e rendere l'applicazione più internazionale.

## Struttura delle traduzioni

### File di localizzazione

- `src/locales/it.json` - Traduzioni italiane
- `src/locales/en.json` - Traduzioni inglesi

### Struttura delle chiavi

Le traduzioni sono organizzate per tipo di valore, eliminando i duplicati:

```json
{
  "common": {
    "labels": { "date": "...", "amount": "...", "supplier": "..." },
    "placeholders": { "dateFormat": "...", "search": "..." },
    "messages": { "required": "...", "tooLong": "...", "invalid": "..." }
  },
  "buttons": {
    "close": { "label": "...", "icon": "..." },
    "save": { "label": "...", "icon": "..." }
  },
  "dialogs": {
    "cancel": { "title": "...", "message": "...", "icon": "..." }
  },
  "cards": {
    "newRecord": { "title": "...", "subtitle": "..." }
  },
  "navigation": {
    "titles": { "home": "...", "addInvoice": "..." },
    "sections": { "incomingInvoices": "..." },
    "items": { "insertInvoice": "..." }
  }
}
```

## Utilizzo delle costanti i18n

### Composables disponibili

1. **`useLayoutConstants()`** - Costanti per il layout
2. **`useLedgerTableConstants()`** - Costanti per la tabella del ledger
3. **`useLedgerConstants()`** - Costanti per il ledger
4. **`useIncomingInvoiceConstants()`** - Costanti per le fatture in entrata
5. **`useSidebarItems()`** - Elementi del menu sidebar
6. **`useNavigationTitles()`** - Titoli delle pagine

### Esempio di utilizzo

```vue

<template>
  <div>
    <h1>{{ constants.card.title }}</h1>
    <p>{{ constants.card.subtitle }}</p>
    <input :placeholder="constants.dateFormat" />
    <span>{{ labels.date }}</span>
  </div>
</template>

<script setup lang="ts">
  import { useLedgerConstants, useLayoutConstants } from '@/utils/i18nConstants'

  const constants = useLedgerConstants()
  const layoutConstants = useLayoutConstants()
</script>
```

## Aggiungere nuove traduzioni

### 1. Aggiungere le chiavi ai file JSON

**it.json:**

```json
{
  "nuovaSezione": {
    "nuovoCampo": "Valore in italiano"
  }
}
```

**en.json:**

```json
{
  "nuovaSezione": {
    "nuovoCampo": "Value in English"
  }
}
```

### 2. Creare un composable per le nuove costanti

```typescript
// src/utils/i18nConstants.ts
export const useNuovaSezioneConstants = () => {
  const { t } = useI18n()

  return {
    nuovoCampo: t('nuovaSezione.nuovoCampo'),
  }
}
```

### 3. Utilizzare nel componente

```vue
<script setup lang="ts">
import { useNuovaSezioneConstants } from '@/utils/i18nConstants'

const constants = useNuovaSezioneConstants()
</script>
```

## Best Practices

1. **Organizzazione**: Mantenere le chiavi organizzate logicamente
2. **Naming**: Usare nomi descrittivi per le chiavi
3. **Consistenza**: Mantenere la stessa struttura tra le lingue
4. **Fallback**: Assicurarsi che ci sia sempre una traduzione di fallback
5. **Performance**: I composables sono reattivi e si aggiornano automaticamente

## Migrazione dalle costanti vecchie

Le vecchie costanti in `src/utils/constants.ts` sono state sostituite dai composables i18n. Per migrare:

**Prima:**

```typescript
import { LEDGER } from '@/utils/constants'
const constants = LEDGER
```

**Dopo:**

```typescript
import { useLedgerConstants } from '@/utils/i18nConstants'
const constants = useLedgerConstants()
```

## Vantaggi

1. **Internazionalizzazione**: Supporto per più lingue
2. **Manutenibilità**: Traduzioni centralizzate
3. **Reattività**: Aggiornamento automatico al cambio lingua
4. **Type Safety**: TypeScript supporta le chiavi di traduzione
5. **Performance**: Lazy loading delle traduzioni
