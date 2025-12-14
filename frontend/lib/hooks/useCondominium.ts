'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth'; // Si tienes un hook de auth
import { authService } from '@/lib/api/auth.service';
import { useCondominiumContext } from '@/components/providers/condominium-provider';

/**
 * Hook para manejar el condominio ID del usuario autenticado
 * Obtiene el ID del token JWT o del contexto de autenticación
 */
export function useCondominium() {
  // Preferir el contexto si está disponible
  try {
    const ctx = useCondominiumContext();
    return {
      condominiumId: ctx.currentCondominiumId,
      loading: ctx.isLoading,
      error: null,
      switchCondominium: ctx.setCurrentCondominiumId,
      refresh: ctx.refresh,
      isReady: !ctx.isLoading && ctx.currentCondominiumId !== null,
    } as any;
  } catch (e) {
    // No hay provider, seguir con la lógica local
  }

  const [condominiumId, setCondominiumId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extraer condominio ID del token JWT almacenado
  const extractCondominiumIdFromToken = useCallback(async (): Promise<string | null> => {
    try {
      // Intentar obtener del localStorage (donde se guarda el token)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        return null;
      }

      // Decodificar el token JWT (parte payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Buscar condominium_id en el payload del token
      // El backend debe incluir este campo en el token
      const condoId = 
        payload.condominium_id || 
        payload.condominiumId || 
        payload.condo_id || 
        payload.condoId ||
        payload.context?.condominium_id;

      return condoId || null;
    } catch (err) {
      console.error('Error extrayendo condominium ID del token:', err);
      return null;
    }
  }, []);

  // Obtener condominio ID del perfil de usuario
  const fetchCondominiumId = useCallback(async (): Promise<string | null> => {
    try {
      // Opción 1: Si el backend tiene endpoint para obtener perfil de usuario
      const userProfile = await authService.getProfile();
      
      if (userProfile?.condominium_id) {
        return userProfile.condominium_id;
      }

      // Opción 2: Intentar extraer del token
      const condoId = await extractCondominiumIdFromToken();
      if (condoId) {
        return condoId;
      }

      // Opción 3: Si el usuario tiene múltiples condominios, usar el primero
      if (userProfile?.condominiums && userProfile.condominiums.length > 0) {
        return userProfile.condominiums[0].id;
      }

      return null;
    } catch (err) {
      console.error('Error obteniendo condominium ID:', err);
      throw err;
    }
  }, [extractCondominiumIdFromToken]);

  // Cargar condominio ID al montar
  useEffect(() => {
    const loadCondominiumId = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const condoId = await fetchCondominiumId();
        
        if (condoId) {
          setCondominiumId(condoId);
          // También puedes guardarlo en contexto global si es necesario
          localStorage.setItem('current_condominium_id', condoId);
        } else {
          setError('No se pudo determinar el condominio. Contacta al administrador.');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el condominio');
      } finally {
        setLoading(false);
      }
    };

    loadCondominiumId();
  }, [fetchCondominiumId]);

  // Función para cambiar condominio (si el usuario tiene múltiples)
  const switchCondominium = useCallback(async (newCondominiumId: string) => {
    try {
      // Aquí podrías llamar a un endpoint para cambiar el condominio activo
      // Por ahora, solo actualizamos el estado local
      setCondominiumId(newCondominiumId);
      localStorage.setItem('current_condominium_id', newCondominiumId);
      return true;
    } catch (err) {
      console.error('Error cambiando condominio:', err);
      return false;
    }
  }, []);

  // Refrescar condominio ID
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const condoId = await fetchCondominiumId();
      if (condoId) {
        setCondominiumId(condoId);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchCondominiumId]);

  return {
    condominiumId,
    loading,
    error,
    switchCondominium,
    refresh,
    isReady: !loading && !error && condominiumId !== null,
  };
}

/**
 * Hook helper para validar que el condominio ID esté disponible
 * Útil para componentes que requieren el condominio ID
 */
export function useRequiredCondominium() {
  const { condominiumId, loading, error, isReady } = useCondominium();

  if (loading) {
    throw new Promise((resolve) => {
      // Puedes implementar un retry o timeout aquí
      setTimeout(resolve, 100);
    });
  }

  if (error || !condominiumId) {
    throw new Error(error || 'Condominio no disponible. Por favor, inicia sesión nuevamente.');
  }

  return {
    condominiumId,
    isReady,
  };
}