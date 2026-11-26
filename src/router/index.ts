import { useRoles } from '@/composables/useRoles'
import ProductsListView from '@/views/ProductsListView.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ProductView from '@/views/ProductView.vue'

// Lazy load views for better performance
const HomeView = () => import('@/views/HomeView.vue')
const AddIncomingInvoiceView = () => import('@/views/AddIncomingInvoiceView.vue')
const IncomingInvoiceView = () => import('@/views/IncomingInvoiceView.vue')
const IncomingInvoicesListView = () => import('@/views/IncomingInvoicesListView.vue')
const AddUsedReceiptView = () => import('@/views/AddUsedReceiptView.vue')
const UsedReceiptView = () => import('@/views/UsedReceiptView.vue')
const UsedReceiptsListView = () => import('@/views/UsedReceiptsListView.vue')
const AddLedgerEntryView = () => import('@/views/AddLedgerEntryView.vue')
const LedgerEntryView = () => import('@/views/LedgerEntryView.vue')
const LedgerView = () => import('@/views/LedgerView.vue')
const AuditView = () => import('@/views/AuditView.vue')

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
    path: '/usedReceipt',
    name: 'addUsedReceipt',
    component: AddUsedReceiptView,
    meta: {
      title: 'Aggiungi Ricevuta Usato',
    },
  },
  {
    path: '/usedReceipt/:id',
    name: 'usedReceipt',
    component: UsedReceiptView,
    meta: {
      title: 'Dettaglio Ricevuta Usato',
    },
  },
  {
    path: '/usedReceipts',
    name: 'usedReceiptsList',
    component: UsedReceiptsListView,
    meta: {
      title: 'Registro Usato',
    },
  },
  {
    path: '/products',
    name: 'productsList',
    component: ProductsListView,
    meta: {
      title: 'Inventario',
    },
  },
  {
    path: '/product/:id',
    name: 'product',
    component: ProductView,
    meta: {
      title: 'Dettaglio Prodotto',
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
    path: '/audit',
    name: 'audit',
    component: AuditView,
    meta: {
      title: 'Registro Modifiche',
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
  // Fatture e brogliaccio contengono costi: non accessibili senza permessi
  const costsPage = /^\/(incomingInvoice|ledger|usedReceipt)/.test(to.path)
  if (costsPage && !useRoles().canSeeCosts) return next({ name: 'home' })
  if (to.path.startsWith('/audit') && !useRoles().isAdmin) return next({ name: 'home' })
  next()
})

export default router
