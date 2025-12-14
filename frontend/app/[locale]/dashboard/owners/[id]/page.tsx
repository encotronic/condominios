'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { condoService, Owner } from '@/lib/api/condo.service';
import { ArrowLeft, User, Mail, Phone, Home, Edit, Save, X, Trash2, AlertCircle, Loader2, Calendar, Building, CheckCircle, Clock } from 'lucide-react';
import Card from '@/components/ui/card';

export default function OwnerDetailPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const ownerId = params.id as string;
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    identification: '',
    notes: ''
  });

  // Cargar propietario
  useEffect(() => {
    if (ownerId) {
      loadOwner();
    }
  }, [ownerId]);

  const loadOwner = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ownerData = await condoService.getOwnerById(ownerId);
      setOwner(ownerData);
      
      if (ownerData) {
        setFormData({
          name: ownerData.name || '',
          email: ownerData.email || '',
          phone: ownerData.phone || '',
          address: ownerData.address || '',
          identification: ownerData.identification || '',
          notes: ownerData.notes || ''
        });
      }
    } catch (err: any) {
      console.error('Error cargando propietario:', err);
      setError(err.message || 'Error al cargar información del propietario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!ownerId) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      await condoService.updateOwner(ownerId, formData);
      
      // Recargar datos actualizados
      await loadOwner();
      setIsEditing(false);
      
    } catch (err: any) {
      console.error('Error actualizando propietario:', err);
      setError(err.message || 'Error al actualizar el propietario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ownerId || !window.confirm('¿Estás seguro de eliminar este propietario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await condoService.deleteOwner(ownerId);
      router.push(`/${locale}/dashboard/owners`);
    } catch (err: any) {
      console.error('Error eliminando propietario:', err);
      setError(err.message || 'Error al eliminar el propietario');
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
          <p className="mt-3 text-muted-foreground">Cargando información del propietario...</p>
        </div>
      </div>
    );
  }

  if (error && !owner) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
        <p className="text-muted-foreground mb-4 text-center max-w-md">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={loadOwner}
            className="px-4 py-2 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
          >
            Reintentar
          </button>
          <Link
            href={`/${locale}/dashboard/owners`}
            className="px-4 py-2 rounded-lg border text-foreground hover:bg-muted transition-colors font-medium"
          >
            Volver a propietarios
          </Link>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <User className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Propietario no encontrado</h2>
        <p className="text-muted-foreground mb-6">El propietario solicitado no existe o fue eliminado.</p>
        <Link
          href={`/${locale}/dashboard/owners`}
          className="px-5 py-2.5 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
        >
          Ver todos los propietarios
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
            href={`/${locale}/dashboard/owners`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a propietarios
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-condo-blue/10 flex items-center justify-center">
              <User className="w-6 h-6 text-condo-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditing ? 'Editar Propietario' : owner.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? 'Actualiza la información del propietario' : 'Detalles del propietario'}
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
                    name: owner.name || '',
                    email: owner.email || '',
                    phone: owner.phone || '',
                    address: owner.address || '',
                    identification: owner.identification || '',
                    notes: owner.notes || ''
                  });
                }}
                className="px-4 py-2 rounded-lg border text-foreground hover:bg-muted transition-colors font-medium flex items-center gap-2"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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

      {/* Mensajes de error */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Personal */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-condo-blue" />
              Información Personal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nombre completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30">
                    {owner.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Identificación
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="identification"
                    value={formData.identification}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30">
                    {owner.identification || 'No especificada'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Información de Contacto */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-condo-blue" />
              Información de Contacto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30">
                    {owner.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30">
                    {owner.phone || 'No especificado'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Información Adicional */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-condo-blue" />
              Información Adicional
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Dirección
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
                  />
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30">
                    {owner.address || 'No especificada'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Notas
                </label>
                {isEditing ? (
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="text-foreground font-medium p-2.5 rounded-lg bg-muted/30 min-h-[60px]">
                    {owner.notes || 'Sin notas adicionales'}
                  </p>
                )}
              </div>
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
                <p className="text-sm text-muted-foreground">ID del Propietario</p>
                <p className="text-sm font-mono text-foreground bg-muted/30 p-2 rounded mt-1 break-all">
                  {owner.id}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="text-foreground font-medium">
                    {formatDate(owner.created_at)}
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="text-foreground font-medium">
                      {formatDate(owner.updated_at)}
                  </p>
                </div>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </Card>

          {/* Asignación de Unidad */}
          <Card className="border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Unidad Asignada</h3>
            
            {owner.unit_id ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                      Unidad Asignada
                    </span>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                    ID: {owner.unit_id}
                  </p>
                </div>
                <Link
                  href={`/${locale}/dashboard/units/${owner.unit_id}`}
                  className="block text-center px-4 py-2 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
                >
                  Ver Unidad
                </Link>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Este propietario no tiene una unidad asignada
                </p>
                <Link
                  href={`/${locale}/dashboard/units/create?owner_id=${owner.id}`}
                  className="inline-block px-4 py-2 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
                >
                  Asignar Unidad
                </Link>
              </div>
            )}
          </Card>

          {/* Acciones Rápidas */}
          <Card className="border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Acciones Rápidas</h3>
            
            <div className="space-y-2">
              <Link
                href={`/${locale}/dashboard/owners/create`}
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-foreground"
              >
                <User className="w-4 h-4" />
                <span>Crear Nuevo Propietario</span>
              </Link>
              
              <Link
                href={`/${locale}/dashboard/units`}
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-foreground"
              >
                <Building className="w-4 h-4" />
                <span>Ver Todas las Unidades</span>
              </Link>
              
              <button
                onClick={() => navigator.clipboard.writeText(owner.id)}
                className="w-full flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-foreground"
              >
                <span>Copiar ID del Propietario</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}