export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  version: import.meta.env.VITE_VERSION || 'dev',
  timeout: 30000
}

export const isProduction = API_CONFIG.environment === 'production'
export const isStaging = API_CONFIG.environment === 'staging'
export const isDevelopment = API_CONFIG.environment === 'development'
