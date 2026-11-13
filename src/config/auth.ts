import { API_CONFIG } from '@/config/api'

export const AUTH_CONFIG = {
  // In sviluppo locale l'API ha l'autenticazione disattivata (profilo "local"): il login e' saltato.
  // Per provare il login in locale: VITE_AUTH_ENABLED=true
  enabled:
    (import.meta.env.VITE_AUTH_ENABLED ?? String(API_CONFIG.environment !== 'development')) ===
    'true',
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak.guitar.lab',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'guitarlab',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'guitartortona-web',
  // Secondi di validita' residua sotto i quali il token viene rinnovato prima di una chiamata
  minValidity: 30,
}
