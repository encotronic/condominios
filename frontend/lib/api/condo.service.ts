import { api } from './axios-config';
import { snakeToCamel, camelToSnake } from './normalize';
import type { Unit, Owner } from '../../../shared/types/entities';
export type { Unit, Owner } from '../../../shared/types/entities';

// Servicio de condominio
export const condoService = {
  // ===== UNIDADES =====
  async getUnits(options?: { condominiumId?: string }): Promise<Unit[]> {
    const params = options?.condominiumId ? { condominiumId: options.condominiumId } : undefined;
    const response = await api.get('/condo/units', { params });
    const data = response.data || [];
    return Array.isArray(data)
      ? data.map((d: any) => {
          const mapped = snakeToCamel<Unit>(d);
          // normalize numeric-like strings
          if ((mapped as any).aliquotPercentage != null) {
            const v = (mapped as any).aliquotPercentage;
            (mapped as any).aliquotPercentage = typeof v === 'string' ? Number(v) : v;
          }
          return mapped;
        })
      : [];
  },

  async getUnitById(id: string): Promise<Unit> {
    const response = await api.get(`/condo/units/${id}`);
    const mapped = snakeToCamel<Unit>(response.data);
    if ((mapped as any).aliquotPercentage != null) {
      const v = (mapped as any).aliquotPercentage;
      (mapped as any).aliquotPercentage = typeof v === 'string' ? Number(v) : v;
    }
    return mapped;
  },

  async createUnit(unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
    const payload = camelToSnake({
      code: unitData.code,
      aliquotPercentage: unitData.aliquotPercentage,
      ownerId: unitData.ownerId,
    });

    const response = await api.post('/condo/units', payload);
    const mapped = snakeToCamel<Unit>(response.data);
    if ((mapped as any).aliquotPercentage != null) {
      const v = (mapped as any).aliquotPercentage;
      (mapped as any).aliquotPercentage = typeof v === 'string' ? Number(v) : v;
    }
    return mapped;
  },

  async updateUnit(id: string, unitData: Partial<Unit>): Promise<Unit> {
    const payload: any = camelToSnake({
      ...(unitData.code !== undefined ? { code: unitData.code } : {}),
      ...(unitData.aliquotPercentage !== undefined ? { aliquotPercentage: unitData.aliquotPercentage } : {}),
      ...(unitData.ownerId !== undefined ? { ownerId: unitData.ownerId } : {}),
    });

    const response = await api.put(`/condo/units/${id}`, payload);
    const mapped = snakeToCamel<Unit>(response.data);
    if ((mapped as any).aliquotPercentage != null) {
      const v = (mapped as any).aliquotPercentage;
      (mapped as any).aliquotPercentage = typeof v === 'string' ? Number(v) : v;
    }
    return mapped;
  },

  async deleteUnit(id: string): Promise<void> {
    await api.delete(`/condo/units/${id}`);
  },

  // ===== PROPIETARIOS =====
  async getOwners(options?: { condominiumId?: string }): Promise<Owner[]> {
    const params = options?.condominiumId ? { condominiumId: options.condominiumId } : undefined;
    const response = await api.get('/condo/owners', { params });
    const data = response.data || [];
    return Array.isArray(data) ? data.map((d: any) => snakeToCamel<Owner>(d)) : [];
  },

  async getOwnerById(id: string): Promise<Owner> {
    const response = await api.get(`/condo/owners/${id}`);
    return snakeToCamel<Owner>(response.data);
  },

  async createOwner(ownerData: Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Owner> {
    const payload = camelToSnake({
      fullName: ownerData.fullName,
      email: ownerData.email,
      phone: ownerData.phone,
      ...(ownerData as any).userId ? { userId: (ownerData as any).userId } : {},
    });

    const response = await api.post('/condo/owners', payload);
    return snakeToCamel<Owner>(response.data);
  },

  async updateOwner(id: string, ownerData: Partial<Owner>): Promise<Owner> {
    const payload = camelToSnake({
      ...(ownerData.fullName !== undefined ? { fullName: ownerData.fullName } : {}),
      ...(ownerData.email !== undefined ? { email: ownerData.email } : {}),
      ...(ownerData.phone !== undefined ? { phone: ownerData.phone } : {}),
    });

    const response = await api.put(`/condo/owners/${id}`, payload);
    return snakeToCamel<Owner>(response.data);
  },

  async deleteOwner(id: string): Promise<void> {
    await api.delete(`/condo/owners/${id}`);
  },
};