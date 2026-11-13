import axios from 'axios'
import { API_CONFIG } from '@/config/api'
import { AUTH_CONFIG } from '@/config/auth'
import { getToken, login } from '@/services/auth/authService'

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL + '/api/v1',
  timeout: API_CONFIG.timeout,
})

// Interceptor per aggiungere il token Keycloak (rinnovato se in scadenza)
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor per gestione errori
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message)

    // Token rifiutato dall'API: sessione non piu' valida, nuovo login
    if (AUTH_CONFIG.enabled && error.response?.status === 401) {
      login()
    }

    // Re-throw the error to be handled by the calling code
    return Promise.reject(error)
  },
)

export default apiClient
