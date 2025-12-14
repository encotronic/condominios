import { api } from './axios-config';
import { snakeToCamel, camelToSnake } from './normalize';
import type { Payment, Unit } from '../../../shared/types/entities';
export type { Payment, Unit } from '../../../shared/types/entities';

export interface UnitSummary {
  unitId: string;
  unitCode: string;
  ownerName?: string;
  totalDebt: number;
  totalPaid: number;
  balance: number;
  lastPaymentDate?: string;
  isDelinquent: boolean;
}

export interface FinancialSummary {
  totalUnits: number;
  activeUnits: number;
  totalMonthlyCharges: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  averagePaymentTime: number;
}

export interface PaymentHistory {
  paymentDate: string;
  unitCode: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
}

export interface DelinquencyReport {
  unitId: string;
  unitCode: string;
  ownerName?: string;
  totalDebt: number;
  daysOverdue: number;
  lastContactDate?: string;
  contactAttempts: number;
}

export const reportsService = {
  // Resumen por unidades
  getUnitsSummary: async () => {
    const response = await api.get('/reports/units-summary');
    const raw = response.data?.data ?? response.data;
    return raw;
  },

  // Estado de cuenta por unidad
  getUnitStatement: async (unitId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = params.toString() 
      ? `/reports/unit-statement/${unitId}?${params.toString()}`
      : `/reports/unit-statement/${unitId}`;
    
    const response = await api.get(url);
    const raw = response.data?.data ?? response.data;
    return raw;
  },

  // Resumen financiero completo
  getFinancialSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if ((filters as any)?.condominiumId) params.append('condominiumId', (filters as any).condominiumId);

    const url = params.toString() 
      ? `/reports/financial-summary?${params.toString()}`
      : '/reports/financial-summary';
    
    const response = await api.get(url);
    const raw = response.data?.data ?? response.data;
    return raw;
  },

  // Historial de pagos
  getPaymentHistory: async (filters?: {
    unitId?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.unitId) params.append('unitId', filters.unitId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if ((filters as any)?.condominiumId) params.append('condominiumId', (filters as any).condominiumId);

    const url = params.toString() 
      ? `/reports/payment-history?${params.toString()}`
      : '/reports/payment-history';
    
    const response = await api.get(url);
    const raw = response.data?.data ?? response.data;
    return raw;
  },

  // Reporte de morosidad
  getDelinquencyReport: async (filters?: {
    minDaysOverdue?: number;
    maxDebtAmount?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.minDaysOverdue) params.append('minDaysOverdue', filters.minDaysOverdue.toString());
    if (filters?.maxDebtAmount) params.append('maxDebtAmount', filters.maxDebtAmount.toString());
    if ((filters as any)?.condominiumId) params.append('condominiumId', (filters as any).condominiumId);

    const url = params.toString() 
      ? `/reports/delinquency?${params.toString()}`
      : '/reports/delinquency';
    
    const response = await api.get(url);
    const raw = response.data?.data ?? response.data;
    return raw;
  },

  // Exportar reporte a formato específico
  exportReport: async (reportType: string, format: 'pdf' | 'excel' | 'csv', filters?: any) => {
    const payload = { reportType, format, filters };
    if (filters?.condominiumId) payload['condominiumId'] = filters.condominiumId;
    const response = await api.post('/reports/export', payload, {
      responseType: format === 'pdf' ? 'blob' : 'json'
    });
    return response.data;
  }
};