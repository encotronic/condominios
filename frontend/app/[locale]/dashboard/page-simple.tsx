'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  Building, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  MoreVertical
} from 'lucide-react';

export default function SimpleDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalOwners: 0,
    monthlyRevenue: 0,
    collectionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setStats({
        totalUnits: 24,
        totalOwners: 18,
        monthlyRevenue: 5820,
        collectionRate: 85,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-condo-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Datos simulados
  const paymentStatusData = [
    { name: 'Pagado', value: 75, color: '#10b981' },
    { name: 'Pendiente', value: 15, color: '#f59e0b' },
    { name: 'Vencido', value: 10, color: '#ef4444' },
  ];

  const recentPayments = [
    { id: 1, unit: 'A-101', amount: 350, date: '2025-12-01', status: 'Pagado' },
    { id: 2, unit: 'B-202', amount: 420, date: '2025-11-28', status: 'Pagado' },
    { id: 3, unit: 'C-303', amount: 380, date: '2025-11-25', status: 'Pendiente' },
    { id: 4, unit: 'A-102', amount: 400, date: '2025-11-20', status: 'Pagado' },
    { id: 5, unit: 'D-404', amount: 320, date: '2025-11-18', status: 'Vencido' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard').welcome}, <span className="text-condo-blue">Admin</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Resumen general del condominio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-condo-blue text-white rounded-lg font-medium hover:bg-condo-blue/90 transition-colors duration-200">
            Generar Reporte
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Units */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard').totalUnits}
              </p>
              <p className="text-2xl font-bold mt-2">{stats.totalUnits}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">+2 este mes</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Owners */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Propietarios
              </p>
              <p className="text-2xl font-bold mt-2">{stats.totalOwners}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">+1 este mes</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ingresos Mensuales
              </p>
              <p className="text-2xl font-bold mt-2">${stats.monthlyRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">+12% vs mes anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard').collectionRate}
              </p>
              <p className="text-2xl font-bold mt-2">{stats.collectionRate}%</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">-3% vs mes anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Versión simple */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Ingresos Mensuales</h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Gráficos deshabilitados temporalmente</p>
              <p className="text-sm text-gray-400 mt-2">Problema técnico con librería de gráficos</p>
            </div>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Estado de Pagos</h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="flex justify-center gap-4 mt-4">
                {paymentStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Pagos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Unidad</th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Monto</th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">{payment.unit}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">${payment.amount}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'Pagado' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : payment.status === 'Pendiente'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="px-3 py-1 text-sm bg-condo-blue text-white rounded-lg hover:bg-condo-blue/90 transition-colors duration-200">
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t">
          <button className="w-full py-2 text-center text-sm text-condo-blue hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
            Ver todos los pagos
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-white dark:bg-gray-800 border rounded-xl hover:border-condo-blue transition-all duration-200 flex flex-col items-center justify-center gap-2">
          <CreditCard className="w-6 h-6 text-condo-blue" />
          <span className="text-sm font-medium">Registrar Pago</span>
        </button>
        <button className="p-4 bg-white dark:bg-gray-800 border rounded-xl hover:border-condo-blue transition-all duration-200 flex flex-col items-center justify-center gap-2">
          <Building className="w-6 h-6 text-condo-blue" />
          <span className="text-sm font-medium">Agregar Unidad</span>
        </button>
        <button className="p-4 bg-white dark:bg-gray-800 border rounded-xl hover:border-condo-blue transition-all duration-200 flex flex-col items-center justify-center gap-2">
          <Users className="w-6 h-6 text-condo-blue" />
          <span className="text-sm font-medium">Nuevo Propietario</span>
        </button>
        <button className="p-4 bg-white dark:bg-gray-800 border rounded-xl hover:border-condo-blue transition-all duration-200 flex flex-col items-center justify-center gap-2">
          <BarChart3 className="w-6 h-6 text-condo-blue" />
          <span className="text-sm font-medium">Generar Reporte</span>
        </button>
      </div>
    </div>
  );
}