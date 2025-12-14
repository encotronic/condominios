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

export interface CondominiumItem {
  id: string;
  name: string;
}

export interface CondominiumListResponse {
  items: CondominiumItem[];
}

// Servicio de autenticación
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Enviar solo datos proporcionados, el backend asignará el condominio
    const loginData = {
      email: credentials.email,
      password: credentials.password,
      condominiumId: credentials.condominiumId || undefined // ← CORREGIDO: camelCase
    };
    
    const response = await apiClient.post('/auth/login', loginData);
    
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
      condominiumId: userData.condominiumId || undefined // ← CORREGIDO: camelCase
    };
    
    const response = await apiClient.post('/auth/register', registerData);
    
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

  // Get current user - VERSIÓN CORREGIDA CON MANEJO DE ERRORES
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      
      // Verificar si el valor es válido antes de parsear
      if (!userStr || 
          userStr === 'null' || 
          userStr === 'undefined' || 
          userStr === '' || 
          userStr.trim() === '') {
        return null;
      }
      
      return JSON.parse(userStr);
    } catch (error) {
      console.error('❌ Error parsing user from localStorage:', error);
      // Limpiar datos corruptos
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      return null;
    }
  },

  // Get token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token && token !== 'null' && token !== 'undefined';
  },

  // Get current user's condominium ID
  getCurrentCondominiumId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const user = this.getCurrentUser();
      if (!user) return null;
      
      // Intentar obtener de diferentes propiedades (backend puede usar diferentes formatos)
      return (
        user.condominium_id || 
        user.condominiumId || 
        user.condo_id || 
        user.condoId
      );
    } catch (error) {
      console.error('Error getting condominium ID:', error);
      return null;
    }
  },

  // Get user profile from API (opcional, para refrescar datos)
  async getProfile(): Promise<any> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};

// Obtener lista de condominios asociados al usuario actual
export const fetchUserCondominiums = async (): Promise<CondominiumItem[]> => {
  try {
    const response = await apiClient.get<CondominiumListResponse>('/auth/condominiums');
    return response.data.items;
  } catch (error: any) {
    if (error?.response?.status === 204) {
      return [];
    }
    throw error;
  }
};