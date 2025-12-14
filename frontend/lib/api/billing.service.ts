import { api } from './axios-config';
import { snakeToCamel, camelToSnake } from './normalize';
import type { Billing, Unit } from '../../../shared/types/entities';
export type { Billing } from '../../../shared/types/entities';

export interface Charge {
  id: string;
  name: string;
  amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  isActive: boolean;
  condominiumId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingUnitRecord {
  id: string;
  billingPeriodId: string;
  unitId: string;
  chargeId: string;
  amount: number;
  isPaid: boolean;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const billingService = {
  // Cargos
  getCharges: async () => {
    const response = await api.get('/billing/charges');
    const raw = response.data?.data ?? response.data;
    const arr = raw || [];
    return Array.isArray(arr) ? arr.map((d: any) => snakeToCamel<Charge>(d)) : [];
  },

  createCharge: async (data: Partial<Charge>) => {
    const payload = camelToSnake(data);
    const response = await api.post('/billing/charges', payload);
    const raw = response.data?.data ?? response.data;
    return snakeToCamel<Charge>(raw);
  },

  updateCharge: async (id: string, data: Partial<Charge>) => {
    const payload = camelToSnake(data);
    const response = await api.put(`/billing/charges/${id}`, payload);
    const raw = response.data?.data ?? response.data;
    return snakeToCamel<Charge>(raw);
  },

  deleteCharge: async (id: string) => {
    const response = await api.delete(`/billing/charges/${id}`);
    return response.data?.data ?? response.data;
  },

  // Generar facturación
  generateBilling: async (periodId: string) => {
    const payload = camelToSnake({ periodId });
    const response = await api.post('/billing/generate', payload);
    return response.data?.data ?? response.data;
  },

  // Registros de deuda por unidad
  getUnitBillingRecords: async (unitId?: string, options?: { condominiumId?: string }) => {
    const params: Record<string, string> = {};
    if (unitId) params.unitId = unitId;
    if (options?.condominiumId) params.condominiumId = options.condominiumId;
    const response = await api.get('/billing/debts', { params: Object.keys(params).length ? params : undefined });
    const raw = response.data?.data ?? response.data;
    const arr = raw || [];
    return Array.isArray(arr) ? arr.map((d: any) => snakeToCamel<BillingUnitRecord>(d)) : [];
  },

  // Resumen financiero
  // Nota: el resumen financiero se expone actualmente bajo /api/reports/financial-summary
  getFinancialSummary: async () => {
    const response = await api.get('/reports/financial-summary');
    return response.data;
  }
};