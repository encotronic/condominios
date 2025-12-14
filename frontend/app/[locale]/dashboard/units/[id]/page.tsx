'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { condoService, Unit, Owner } from '@/lib/api/condo.service';
import { authService } from '@/lib/api/auth.service';
import { Building, Save, X, AlertCircle, CheckCircle, Users, Loader2, Home, Percent, Hash, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EditUnitPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const params = useParams();
  
  const unitId = params.id as string;
  
  // Estados
  const [unit, setUnit] = useState<Unit | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    code: '',
    aliquot_percentage: '',
    is_active: true,
    owner_id: '',
  });

  // Cargar datos
  useEffect(() => {
    if (unitId) {
      loadData();
    }
  }, [unitId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar unidad y propietarios en paralelo
      const [unitData, ownersData] = await Promise.all([
        condoService.getUnitById(unitId),
        condoService.getOwners()
      ]);
      
      setUnit(unitData);
      setOwners(ownersData || []);
      
      if (unitData) {
        setFormData({
          code: unitData.code || '',
          aliquot_percentage: unitData.aliquot_percentage || '',
          is_active: unitData.is_active ?? true,
          owner_id: unitData.owner_id || '',
        });
      }
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message || 'Error al cargar información de la unidad');
    } finally {
      setIsLoading(false);
      setIsLoadingOwners(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      setError('El código de unidad es requerido');
      return false;
    }
    
    if (!formData.aliquot_percentage.trim()) {
      setError('La alícuota es requerida');
      return false;
    }
    
    const aliquot = parseFloat(formData.aliquot_percentage);
    if (isNaN(aliquot) || aliquot <= 0 || aliquot > 100) {
      setError('La alícuota debe ser un número entre 0.01 y 100');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Obtener condominium_id del usuario actual
      const condoId = authService.getCurrentCondominiumId();
      if (!condoId) {
        throw new Error('No se pudo identificar el condominio. Por favor, inicia sesión nuevamente.');
      }
      
      const updateData = {
        code: formData.code.trim(),
        aliquot_percentage: parseFloat(formData.aliquot_percentage).toFixed(2),
        is_active: formData.is_active,
        owner_id: formData.owner_id.trim() || undefined,
        condominium_id: condoId,
      };
      
      await condoService.updateUnit(unitId, updateData);
      
      // Recargar datos
      await loadData();
      setSuccess('Unidad actualizada exitosamente');
      setIsEditing(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      console.error('Error actualizando unidad:', err);
      setError(err.message || 'Error al actualizar la unidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta unidad? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await condoService.deleteUnit(unitId);
      router.push(`/${locale}/dashboard/units`);
    } catch (err: any) {
      console.error('Error eliminando unidad:', err);
      setError(err.message || 'Error al eliminar la unidad');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-condo-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-muted-foreground">Cargando información de la unidad...</p>
        </div>
      </div>
    );
  }

  if (error && !unit) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
        <p className="text-muted-foreground mb-4 text-center max-w-md">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
          >
            Reintentar
          </button>
          <Link
            href={`/${locale}/dashboard/units`}
            className="px-4 py-2 rounded-lg border text-foreground hover:bg-muted transition-colors font-medium"
          >
            Volver a unidades
          </Link>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Building className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Unidad no encontrada</h2>
        <p className="text-muted-foreground mb-6">La unidad solicitada no existe o fue eliminada.</p>
        <Link
          href={`/${locale}/dashboard/units`}
          className="px-5 py-2.5 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
        >
          Ver todas las unidades
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/dashboard/units`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a unidades
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-condo-blue/10 flex items-center justify-center">
              <Building className="w-6 h-6 text-condo-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditing ? 'Editar Unidad' : `Unidad ${unit.code}`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? 'Actualiza la información de la unidad' : 'Detalles de la unidad'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    code: unit.code || '',
                    aliquot_percentage: unit.aliquot_percentage || '',
                    is_active: unit.is_active ?? true,
                    owner_id: unit.owner_id || '',
                  });
                }}
                className="px-4 py-2 rounded-lg border text-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg border text-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-up">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-fade-up">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <Card className="border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-condo-blue" />
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Código de Unidad
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                    required
                  />
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {unit.code}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Alícuota (%)
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="number"
                      name="aliquot_percentage"
                      value={formData.aliquot_percentage}
                      onChange={handleChange}
                      step="0.01"
                      min="0.01"
                      max="100"
                      className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      %
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    {unit.aliquot_percentage}%
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Propietario */}
          <Card className="border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-condo-blue" />
              Propietario Asignado
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Propietario
              </label>
              {isEditing ? (
                <select
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                >
                  <option value="">Sin propietario asignado</option>
                  {isLoadingOwners ? (
                    <option value="" disabled>Cargando propietarios...</option>
                  ) : owners.length === 0 ? (
                    <option value="" disabled>No hay propietarios registrados</option>
                  ) : (
                    owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} - {owner.email}
                      </option>
                    ))
                  )}
                </select>
              ) : unit.owner_id ? (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">
                        Propietario Asignado
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        ID: {unit.owner_id}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/dashboard/owners/${unit.owner_id}`}
                      className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium text-amber-700 dark:text-amber-300">
                      Sin propietario asignado
                    </span>
                  </div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Esta unidad no tiene un propietario asignado.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Estado */}
          <Card className="border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Estado</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Estado de la Unidad
                </p>
                <p className="text-muted-foreground">
                  {unit.is_active ? 'Activa - Genera facturación' : 'Inactiva - No genera facturación'}
                </p>
              </div>
              
              {isEditing ? (
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full ${formData.is_active ? 'bg-condo-blue' : 'bg-gray-300'} transition-colors`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-6' : ''} shadow-sm`}></div>
                  </div>
                  <div className="ml-3 text-foreground font-medium">
                    {formData.is_active ? 'Activa' : 'Inactiva'}
                  </div>
                </label>
              ) : (
                <div className={`px-4 py-2 rounded-full ${unit.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'} font-medium`}>
                  {unit.is_active ? 'ACTIVA' : 'INACTIVA'}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Información del Sistema */}
        <div className="space-y-6">
          {/* Información del Sistema */}
          <Card className="border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-condo-blue" />
              Información del Sistema
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">ID de la Unidad</p>
                <p className="text-sm font-mono text-foreground bg-muted/30 p-2 rounded mt-1 break-all">
                  {unit.id}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="text-foreground font-medium">
                    {formatDate(unit.created_at)}
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="text-foreground font-medium">
                    {formatDate(unit.updated_at)}
                  </p>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </Card>

          {/* Información Financiera */}
          <Card className="border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Información Financiera</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alícuota</span>
                <span className="font-medium text-foreground">{unit.aliquot_percentage}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span className={`font-medium ${unit.is_active ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {unit.is_active ? 'Genera cobros' : 'No genera cobros'}
                </span>
              </div>
              
              <div className="pt-3 border-t">
                <Link
                  href={`/${locale}/dashboard/payments?unitId=${unit.id}`}
                  className="block text-center px-4 py-2 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
                >
                  Ver Historial de Pagos
                </Link>
              </div>
            </div>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Acciones Rápidas</h3>
            
            <div className="space-y-2">
              <Link
                href={`/${locale}/dashboard/units/create`}
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-foreground"
              >
                <Building className="w-4 h-4" />
                <span>Crear Nueva Unidad</span>
              </Link>
              
              <Link
                href={`/${locale}/dashboard/owners`}
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-foreground"
              >
                <Users className="w-4 h-4" />
                <span>Ver Todos los Propietarios</span>
              </Link>
              
              <button
                onClick={() => navigator.clipboard.writeText(unit.id)}
                className="w-full flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-foreground"
              >
                <span>Copiar ID de la Unidad</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente ArrowLeft para evitar error
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);