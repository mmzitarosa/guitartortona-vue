import Keycloak from 'keycloak-js'
import { AUTH_CONFIG } from '@/config/auth'

const keycloak = new Keycloak({
  url: AUTH_CONFIG.url,
  realm: AUTH_CONFIG.realm,
  clientId: AUTH_CONFIG.clientId,
})

/**
 * Esegue il login (Authorization Code + PKCE) prima di avviare l'app.
 * Se l'utente non e' autenticato viene reindirizzato a Keycloak.
 */
export async function initAuth(): Promise<void> {
  if (!AUTH_CONFIG.enabled) return

  await keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  })
}

/** Restituisce un access token valido (lo rinnova se sta per scadere). */
export async function getToken(): Promise<string | undefined> {
  if (!AUTH_CONFIG.enabled) return undefined

  try {
    await keycloak.updateToken(AUTH_CONFIG.minValidity)
  } catch {
    // Sessione scaduta o revocata: nuovo login
    await keycloak.login()
  }
  return keycloak.token
}

export function login(): Promise<void> {
  return keycloak.login()
}

export function logout(): Promise<void> {
  return keycloak.logout({ redirectUri: window.location.origin })
}

export function getUsername(): string | undefined {
  return keycloak.tokenParsed?.['preferred_username'] as string | undefined
}

export function hasRole(role: string): boolean {
  return keycloak.hasRealmRole(role)
}
