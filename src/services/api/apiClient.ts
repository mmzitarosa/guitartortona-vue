import axios, { type AxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  //Qui si potrebbe mettere in prima posizione (||) la costante e lasciare il localhost come default
  baseURL: 'http://192.168.1.119/api/v1',
  timeout: 5000
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
