import { apiClient } from './axios-config';

// Interfaces
export interface LoginRequest {
  email: string;
  password: string;
  condominiumId?: string;  // ← CAMBIADO: camelCase y opcional
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;        // ← CAMBIADO: camelCase
  role: 'ADMIN' | 'MANAGER' | 'UNIT_OWNER';
  condominiumId?: string;  // ← CAMBIADO: camelCase
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    condominium_id: string;
  };
  // Campos que puede devolver el backend
  id?: string;
  fullName?: string;
  role?: string;
  condominiumId?: string;
}

// Servicio de autenticación
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Agregar condominiumId si no viene
    const loginData = {
      email: credentials.email,
      password: credentials.password,
      condominiumId: credentials.condominiumId || '5074d155-ba23-4ca2-9659-b585060d4632'
    };
    
    const response = await apiClient.post('/api/auth/login', loginData);
    
    // Guardar token y usuario solo en cliente
    if (typeof window !== 'undefined') {
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        
        // Preparar datos del usuario para guardar
        const userData = {
          id: response.data.id || response.data.user?.id,
          email: response.data.email || response.data.user?.email,
          name: response.data.fullName || response.data.user?.fullName,
          role: response.data.role || response.data.user?.role,
          condominium_id: response.data.condominiumId || response.data.user?.condominiumId
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
    
    return response.data;
  },

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Asegurar formato correcto
    const registerData = {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      role: userData.role,
      condominiumId: userData.condominiumId || '5074d155-ba23-4ca2-9659-b585060d4632'
    };
    
    const response = await apiClient.post('/api/auth/register', registerData);
    
    if (typeof window !== 'undefined') {
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  },

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  // Get current user
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
};