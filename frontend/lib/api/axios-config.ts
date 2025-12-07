import axios from 'axios';

// URL del backend - CONFIRMADA: http://localhost:5000
const BACKEND_URL = 'http://localhost:5000';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Solo en el cliente (no en SSR)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo en el cliente
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient, BACKEND_URL };