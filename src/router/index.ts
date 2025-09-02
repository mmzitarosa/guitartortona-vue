import AddIncomingInvoiceView from '@/views/AddIncomingInvoiceView.vue'
import HomeView from '@/views/HomeView.vue'
import IncomingInvoiceView from '@/views/IncomingInvoiceView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import AddLedgerEntryView from '@/views/AddLedgerEntryView.vue'
import LedgerEntryView from '@/views/LedgerEntryView.vue'
import LedgerView from '@/views/LedgerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/incomingInvoice', name: 'addIncomingInvoice', component: AddIncomingInvoiceView },
    { path: '/incomingInvoice/:id', name: 'incomingInvoice', component: IncomingInvoiceView },
    { path: '/ledgerEntry', name: 'addLedgerEntry', component: AddLedgerEntryView },
    { path: '/ledgerEntry/:id', name: 'ledgerEntry', component: LedgerEntryView },
    { path: '/ledger', name: 'ledger', component: LedgerView },
  ]
})

export default router
