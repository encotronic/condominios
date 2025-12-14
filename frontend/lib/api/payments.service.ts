import { api } from './axios-config';
import { snakeToCamel, camelToSnake } from './normalize';
import type { Payment } from '../../../shared/types/entities';
export type { Payment } from '../../../shared/types/entities';

export interface PaymentSummary {
  totalPayments: number;
  totalCollected: number;
  pendingAmount: number;
  collectionRate: number;
  recentPayments: Payment[];
}

export const paymentsService = {
  // Registrar pago
  registerPayment: async (recordId: string, data: {
    amount: number;
    paymentMethod: Payment['payment_method'] | Payment['paymentMethod'];
    referenceNumber?: string;
    notes?: string;
    paymentDate?: string;
  }) => {
    const payload = camelToSnake({
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      paymentDate: data.paymentDate,
    });

    const response = await api.post(`/payments/register/${recordId}`, payload);
    return snakeToCamel<Payment>(response.data);
  },

  // Obtener pagos
  getPayments: async (filters?: {
    unitId?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    condominiumId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.unitId) params.append('unitId', filters.unitId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);

    const base = '/payments';
    const url = params.toString() ? `${base}?${params.toString()}` : base;
    const response = await api.get(url);
    const raw = response.data?.data ?? response.data;
    const data = raw || [];
    return Array.isArray(data)
      ? data.map((d: any) => {
          const mapped = snakeToCamel<Payment>(d);
          if ((mapped as any).amount != null) (mapped as any).amount = Number((mapped as any).amount);
          if ((mapped as any).amountDue != null) (mapped as any).amountDue = Number((mapped as any).amountDue);
          return mapped;
        })
      : [];
  },

  // Obtener pago específico
  getPayment: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    const raw = response.data?.data ?? response.data;
    return snakeToCamel<Payment>(raw);
  },

  // Pagos por unidad
  getPaymentsByUnit: async (unitId: string, options?: { condominiumId?: string }) => {
    const params = options?.condominiumId ? { condominiumId: options.condominiumId } : undefined;
    const response = await api.get(`/payments/unit/${unitId}`, { params });
    const raw = response.data?.data ?? response.data;
    const data = raw || [];
    return Array.isArray(data) ? data.map((d: any) => snakeToCamel<Payment>(d)) : [];
  },

  // Resumen de pagos
  getPaymentSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
    condominiumId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const base = '/payments/summary';
    const url = params.toString() ? `${base}?${params.toString()}` : base;
    const response = await api.get(url);
    return response.data;
  },

  // Historial de pagos para reportes (este endpoint está en /reports)
  getPaymentHistory: async (filters?: {
    unitId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    condominiumId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.unitId) params.append('unitId', filters.unitId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.condominiumId) params.append('condominiumId', filters.condominiumId);

    const url = params.toString() ? `/reports/payment-history?${params.toString()}` : '/reports/payment-history';
    const response = await api.get(url);
    return response.data;
  }
};