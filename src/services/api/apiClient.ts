import axios from 'axios'
import { API_CONFIG } from '@/config/api.ts'

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL + '/api/v1',
  timeout: API_CONFIG.timeout,
})

// Interceptor per aggiungere token di autenticazione
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor per gestione errori
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    // Qui puoi gestire redirect a login o notifiche globali
    return Promise.reject(error);
  }
);

export default apiClient;
