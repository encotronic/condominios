'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { condoService, Owner } from '@/lib/api/condo.service';
import { Users, Plus, Search, Filter, Edit, Trash2, Eye, Mail, Phone } from 'lucide-react';
import Card from '@/components/ui/card';

export default function OwnersPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar propietarios
  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ownersData = await condoService.getOwners();
      setOwners(ownersData || []);
    } catch (err: any) {
      console.error('Error cargando propietarios:', err);
      setError(err.message || 'Error al cargar propietarios');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar propietarios
  const filteredOwners = owners.filter(owner => {
    if (!owner || !owner.name) return false;
    
    return (
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (owner.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (owner.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Propietarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra los propietarios del condominio
          </p>
        </div>
        
        <Link
          href={`/${locale}/dashboard/owners/create`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-condo-blue text-white font-semibold hover:bg-condo-blue/90 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nuevo Propietario
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
          />
        </div>
      </Card>

      {/* Mensajes de estado */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <p className="font-medium">{error}</p>
          <button
            onClick={loadOwners}
            className="mt-2 text-sm underline hover:text-destructive/80"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de propietarios */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-condo-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-muted-foreground">Cargando propietarios...</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground">No hay propietarios</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm 
                ? 'No se encontraron propietarios con la búsqueda aplicada'
                : 'Comienza agregando tu primer propietario'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-condo-blue hover:text-condo-blue/80 font-medium"
              >
                Limpiar búsqueda
              </button>
            ) : (
              <Link
                href={`/${locale}/dashboard/owners/create`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar primer propietario
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Contacto</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Unidad Asignada</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Creado</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => (
                  <tr key={owner.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-condo-teal/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-condo-teal" />
                        </div>
                        <div>
                          <p className="font-medium">{owner.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{owner.email}</span>
                        </div>
                        {owner.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{owner.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {owner.unit_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Unidad #{owner.unit_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(owner.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${locale}/dashboard/owners/${owner.id}`}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/owners/${owner.id}?edit=true`}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {/* TODO: Implementar eliminación */}}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Propietarios</p>
              <p className="text-2xl font-bold text-foreground mt-1">{owners.length}</p>
            </div>
            <Users className="w-10 h-10 text-condo-blue/20" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Con Unidad Asignada</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {owners.filter(o => o.unit_id).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-500">✓</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sin Asignar</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {owners.filter(o => !o.unit_id).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-500">!</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}