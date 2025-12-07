'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { condoService, Unit } from '@/lib/api/condo.service';
import { Building, Plus, Search, Filter, Edit, Trash2, Eye, Users } from 'lucide-react';
import Card from '@/components/ui/card';

export default function UnitsPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('ALL');

  // Cargar unidades
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Iniciando carga de unidades...');
      const unitsData = await condoService.getUnits();
      console.log('Unidades recibidas:', unitsData);
      console.log('Ejemplo de unidad:', unitsData[0]);
      setUnits(unitsData || []);
    } catch (err: any) {
      console.error('Error cargando unidades:', err);
      setError(err.message || 'Error al cargar unidades');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar unidades
  const filteredUnits = units.filter(unit => {
    // Validar que unit y code existan
    if (!unit || !unit.code) return false;
    
    const matchesSearch = 
      unit.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActive = 
      filterActive === 'ALL' || 
      (filterActive === 'ACTIVE' && (unit.is_active ?? true)) ||
      (filterActive === 'INACTIVE' && !(unit.is_active ?? true));
    
    return matchesSearch && matchesActive;
  });

  // DEBUG: Mostrar unidades y filteredUnits
  console.log('filteredUnits:', filteredUnits);
  console.log('units:', units);

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
          <h1 className="text-3xl font-bold text-foreground">Unidades</h1>
          <p className="text-muted-foreground mt-1">
            Administra las unidades del condominio
          </p>
        </div>
        
        <Link
          href={`/${locale}/dashboard/units/create`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-condo-blue text-white font-semibold hover:bg-condo-blue/90 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nueva Unidad
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número de unidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro de estado */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-condo-blue focus:border-transparent"
          >
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Activas</option>
            <option value="INACTIVE">Inactivas</option>
          </select>
        </div>
      </Card>

      {/* Mensajes de estado */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <p className="font-medium">{error}</p>
          <button
            onClick={loadUnits}
            className="mt-2 text-sm underline hover:text-destructive/80"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de unidades */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-condo-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-muted-foreground">Cargando unidades...</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground">No hay unidades</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm || filterActive !== 'ALL' 
                ? 'No se encontraron unidades con los filtros aplicados'
                : 'Comienza agregando tu primera unidad'}
            </p>
            {(searchTerm || filterActive !== 'ALL') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterActive('ALL');
                }}
                className="mt-3 text-condo-blue hover:text-condo-blue/80 font-medium"
              >
                Limpiar filtros
              </button>
            ) : (
              <Link
                href={`/${locale}/dashboard/units/create`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-condo-blue text-white font-medium hover:bg-condo-blue/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar primera unidad
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Unidad</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Alícuota</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Creado</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{unit.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {unit.aliquot_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        unit.is_active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {unit.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {unit.created_at ? formatDate(unit.created_at) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${locale}/dashboard/units/${unit.id}`}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${locale}/dashboard/units/${unit.id}?edit=true`}
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
              <p className="text-sm text-muted-foreground">Total Unidades</p>
              <p className="text-2xl font-bold text-foreground mt-1">{units.length}</p>
            </div>
            <Building className="w-10 h-10 text-condo-blue/20" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unidades Activas</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {units.filter(u => u.is_active).length}
              </p>
            </div>
            <Users className="w-10 h-10 text-emerald-500/20" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alícuota Promedio</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {units.length > 0 
                  ? `${(units.reduce((sum, unit) => sum + parseFloat(unit.aliquot_percentage || '0'), 0) / units.length).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-purple-500">%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}