# Responsività

## Breakpoint

Si usano i breakpoint di default di Tailwind. Il layout cambia in due punti:

- `lg` (1024 px): sotto questa soglia la sidebar diventa un drawer, aperto dal pulsante hamburger nella barra superiore.
- Sotto `lg` i contenuti occupano tutta la larghezza.

Le viste sono verificate a 1080 px (desktop) e 429 px (smartphone).

## Regola per il layout

Il contenitore principale è un elemento flex (`flex-1`): deve avere `min-w-0`, altrimenti un contenuto largo, come una `DataTable` con colonne a larghezza minima, allarga l'intera pagina oltre lo schermo. Le tabelle scorrono in orizzontale all'interno del proprio contenitore.

## Pagine verificate (1080 px e 429 px, senza scroll orizzontale della pagina)

`/`, `/incomingInvoice`, `/incomingInvoice/:id` (anche con `editable=true`), `/incomingInvoices`, `/products`, `/product/:id` (anche con `editable=true`), `/ledgerEntry`, `/ledgerEntry/:id`, `/ledger`.
