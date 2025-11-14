import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Lazy load views for better performance
const HomeView = () => import('@/views/HomeView.vue')
const AddIncomingInvoiceView = () => import('@/views/AddIncomingInvoiceView.vue')
const IncomingInvoiceView = () => import('@/views/IncomingInvoiceView.vue')
const IncomingInvoicesListView = () => import('@/views/IncomingInvoicesListView.vue')
const AddLedgerEntryView = () => import('@/views/AddLedgerEntryView.vue')
const LedgerEntryView = () => import('@/views/LedgerEntryView.vue')
const LedgerView = () => import('@/views/LedgerView.vue')

/**
 * Application routes configuration
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Home',
    },
  },
  {
    path: '/incomingInvoice',
    name: 'addIncomingInvoice',
    component: AddIncomingInvoiceView,
    meta: {
      title: 'Aggiungi Fattura',
    },
  },
  {
    path: '/incomingInvoice/:id',
    name: 'incomingInvoice',
    component: IncomingInvoiceView,
    meta: {
      title: 'Dettaglio Fattura',
    },
  },
  {
    path: '/incomingInvoices',
    name: 'incomingInvoicesList',
    component: IncomingInvoicesListView,
    meta: {
      title: 'Lista Fatture',
    },
  },
  {
    path: '/ledgerEntry',
    name: 'addLedgerEntry',
    component: AddLedgerEntryView,
    meta: {
      title: 'Aggiungi Record',
    },
  },
  {
    path: '/ledgerEntry/:id',
    name: 'ledgerEntry',
    component: LedgerEntryView,
    meta: {
      title: 'Dettaglio Record',
    },
  },
  {
    path: '/ledger',
    name: 'ledger',
    component: LedgerView,
    meta: {
      title: 'Brogliaccio',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Global navigation guard for title updates
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Vue Guitar`
  }
  next()
})

export default router
