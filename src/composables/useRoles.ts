import { AUTH_CONFIG } from '@/config/auth'
import { hasRole } from '@/services/auth/authService'

const ADMIN = 'app-admin'
const USER = 'app-user'

/**
 * Permessi in base ai ruoli Keycloak. Senza autenticazione (sviluppo locale) tutto è consentito.
 * Il controllo reale resta sull'API: qui si adatta solo l'interfaccia.
 */
export function useRoles() {
  const isAdmin = !AUTH_CONFIG.enabled || hasRole(ADMIN)
  const isUser = isAdmin || hasRole(USER)

  return {
    /** Registro di audit e modifiche riservate */
    isAdmin,
    /** Modifiche e vendite */
    canEdit: isUser,
    /** Cancellazioni */
    canDelete: isAdmin,
    /** Costi, fatture e brogliaccio */
    canSeeCosts: isUser,
  }
}
