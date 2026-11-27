import { AUTH_CONFIG } from '@/config/auth'
import { hasRole } from '@/services/auth/authService'
import {
  documentPermissions,
  ledgerPermissions,
  receiptPermissions,
  type DocumentLike,
} from '@/utils/permissions'

const ADMIN = 'app-admin'
const USER = 'app-user'

/**
 * Permessi in base ai ruoli Keycloak. Senza autenticazione (sviluppo locale) tutto è consentito.
 * Il controllo reale resta sull'API: qui si adatta solo l'interfaccia.
 */
export function useRoles() {
  const isAdmin = !AUTH_CONFIG.enabled || hasRole(ADMIN)
  const isUser = isAdmin || hasRole(USER)
  const roles = { isAdmin, isUser }

  return {
    /** Registro di audit e modifiche riservate */
    isAdmin,
    /** Modifiche e vendite */
    canEdit: isUser,
    /** Cancellazioni */
    canDelete: isAdmin,
    /** Costi, fatture e brogliaccio */
    canSeeCosts: isUser,
    /** Azioni consentite su una fattura, in base a stato e ruolo */
    invoicePermissions: (doc: DocumentLike) => documentPermissions(doc, roles),
    /** Azioni consentite su una ricevuta dell'usato, in base a stato e ruolo */
    receiptPermissions: (doc: DocumentLike) => receiptPermissions(doc, roles),
    /** Azioni consentite su una riga del brogliaccio */
    ledgerPermissions: (entry: { archived?: boolean; status?: string }) => ledgerPermissions(entry, roles),
  }
}
