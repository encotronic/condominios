'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { condoService, Owner } from '@/lib/api/condo.service';
import { authService } from '@/lib/api/auth.service'; // ← AGREGADO
import { Building, Save, X, AlertCircle, CheckCircle, Users, Loader2 } from 'lucide-react';
import Card from '@/components/ui/card';

export default function CreateUnitPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    code: '',
    aliquot_percentage: '',
    is_active: true,
    owner_id: '',
  });
  
  // Estados para propietarios
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);
  const [ownersError, setOwnersError] = useState<string | null>(null);
  
  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar propietarios al montar
  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setIsLoadingOwners(true);
      setOwnersError(null);
      const ownersData = await condoService.getOwners();
      setOwners(ownersData || []);
    } catch (err: any) {
      console.error('Error cargando propietarios:', err);
      setOwnersError(err.message || 'Error al cargar la lista de propietarios');
    } finally {
      setIsLoadingOwners(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Limpiar errores al escribir
    if (submitError) setSubmitError(null);
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.code.trim()) {
      setSubmitError('El código de unidad es requerido');
      return false;
    }
    
    if (!formData.aliquot_percentage.trim()) {
      setSubmitError('La alícuota es requerida');
      return false;
    }
    
    const aliquot = parseFloat(formData.aliquot_percentage);
    if (isNaN(aliquot) || aliquot <= 0 || aliquot > 100) {
      setSubmitError('La alícuota debe ser un número entre 0.01 y 100');
      return false;
    }
    
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      // Obtener condominium_id del usuario actual ← CORREGIDO
      const condoId = authService.getCurrentCondominiumId();
      if (!condoId) {
        throw new Error('No se pudo identificar el condominio. Por favor, inicia sesión nuevamente.');
      }

      // Preparar datos para enviar
      const unitData = {
        code: formData.code.trim(),
        aliquot_percentage: parseFloat(formData.aliquot_percentage).toFixed(2),
        is_active: formData.is_active,
        owner_id: formData.owner_id.trim() || undefined,
        condominium_id: condoId, // ← USAR ID REAL DEL USUARIO
      };

      // Crear unidad
      await condoService.createUnit(unitData);
      
      // Éxito
      setSuccess('Unidad creada exitosamente. Redirigiendo...');
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push(`/${locale}/dashboard/units`);
      }, 1500);

    } catch (err: any) {
      // Manejo de errores
      console.error('Error detallado:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear la unidad';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    router.push(`/${locale}/dashboard/units`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Unidad</h1>
          <p className="text-muted-foreground mt-1">
            Crear una nueva unidad en el condominio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/dashboard/units`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X className="w-5 h-5" />
            Cancelar
          </Link>
        </div>
      </div>

      {/* Formulario */}
      <Card className="p-6">
        {/* Mensajes de estado */}
        {submitError && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-fade-up">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Código */}
            <div className="space-y-3">
              <label htmlFor="code" className="text-sm font-medium text-foreground">
                Código de Unidad *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Building className="w-5 h-5" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ej: A-101, B-202"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Identificador único de la unidad (piso-número)
              </p>
            </div>

            {/* Campo Alícuota */}
            <div className="space-y-3">
              <label htmlFor="aliquot_percentage" className="text-sm font-medium text-foreground">
                Alícuota (%) *
              </label>
              <div className="relative">
                <input
                  id="aliquot_percentage"
                  name="aliquot_percentage"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={formData.aliquot_percentage}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.00"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  %
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Porcentaje de participación (ej: 25.50 para 25.5%)
              </p>
            </div>

            {/* Campo Propietario */}
            <div className="space-y-3">
              <label htmlFor="owner_id" className="text-sm font-medium text-foreground">
                Propietario (Opcional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                </div>
                <select
                  id="owner_id"
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingOwners}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
                  <option value="">Seleccionar propietario...</option>
                  {isLoadingOwners ? (
                    <option value="" disabled>
                      Cargando propietarios...
                    </option>
                  ) : ownersError ? (
                    <option value="" disabled className="text-destructive">
                      Error cargando propietarios
                    </option>
                  ) : owners.length === 0 ? (
                    <option value="" disabled>
                      No hay propietarios registrados
                    </option>
                  ) : (
                    owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} - {owner.email}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {isLoadingOwners && !ownersError && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Cargando lista de propietarios...</span>
                </div>
              )}
              
              {ownersError && (
                <div className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{ownersError}</span>
                  <button
                    onClick={loadOwners}
                    className="ml-2 text-condo-blue hover:text-condo-blue/80 underline text-xs"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              
              {!isLoadingOwners && !ownersError && owners.length === 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>No hay propietarios registrados. </span>
                  <Link
                    href={`/${locale}/dashboard/owners/create`}
                    className="text-condo-blue hover:text-condo-blue/80 underline"
                  >
                    Crear primero un propietario
                  </Link>
                </div>
              )}
              
              {!isLoadingOwners && !ownersError && owners.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selecciona un propietario existente o deja vacío para crear sin propietario
                </p>
              )}
            </div>

            {/* Campo Estado */}
            <div className="space-y-3">
              <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                Estado
              </label>
              <div className="flex items-center h-12">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full ${formData.is_active ? 'bg-condo-blue' : 'bg-gray-300'} transition-colors`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-6' : ''} shadow-sm`}></div>
                  </div>
                  <div className="ml-3 text-foreground font-medium">
                    {formData.is_active ? 'Activa' : 'Inactiva'}
                  </div>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Unidades inactivas no generarán facturación
              </p>
            </div>
          </div>

          {/* Notas informativas */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Información importante
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• El código de unidad debe ser único en el condominio</li>
              <li>• La alícuota total de todas las unidades debe sumar 100%</li>
              <li>• Puedes asignar un propietario existente o dejar vacío</li>
              <li>• Las unidades inactivas no generarán cobros automáticos</li>
              <li>• Si no ves propietarios, créalos primero en la sección Propietarios</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingOwners}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-condo-blue text-white font-semibold hover:bg-condo-blue/90 focus:outline-none focus:ring-2 focus:ring-condo-blue focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Crear Unidad</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-input bg-background text-foreground font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Enlaces rápidos */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href={`/${locale}/dashboard/units`}
          className="inline-flex items-center gap-2 text-sm text-condo-blue hover:text-condo-blue/80 font-medium"
        >
          ← Volver a la lista de unidades
        </Link>
        <span className="text-muted-foreground hidden sm:block">•</span>
        <Link
          href={`/${locale}/dashboard/owners/create`}
          className="inline-flex items-center gap-2 text-sm text-condo-blue hover:text-condo-blue/80 font-medium"
        >
          <Users className="w-4 h-4" />
          Crear nuevo propietario
        </Link>
        <span className="text-muted-foreground hidden sm:block">•</span>
        <Link
          href={`/${locale}/dashboard/owners`}
          className="inline-flex items-center gap-2 text-sm text-condo-blue hover:text-condo-blue/80 font-medium"
        >
          Ver todos los propietarios
        </Link>
      </div>
    </div>
  );
}