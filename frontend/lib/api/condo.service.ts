import { apiClient } from './axios-config';

// Interfaces
export interface Unit {
  id: string;
  unit_number: string;
  aliquot: number;
  is_active: boolean;
  condominium_id: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit_id?: string;
  condominium_id: string;
  created_at: string;
  updated_at: string;
}

// Servicio de condominio
export const condoService = {
  // ===== UNIDADES =====
  async getUnits(): Promise<Unit[]> {
    const response = await apiClient.get('/api/condo/units');
    return response.data;
  },

  async getUnitById(id: string): Promise<Unit> {
    const response = await apiClient.get(`/api/condo/units/${id}`);
    return response.data;
  },

  async createUnit(unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<Unit> {
    const response = await apiClient.post('/api/condo/units', unitData);
    return response.data;
  },

  async updateUnit(id: string, unitData: Partial<Unit>): Promise<Unit> {
    const response = await apiClient.put(`/api/condo/units/${id}`, unitData);
    return response.data;
  },

  async deleteUnit(id: string): Promise<void> {
    await apiClient.delete(`/api/condo/units/${id}`);
  },

  // ===== PROPIETARIOS =====
  async getOwners(): Promise<Owner[]> {
    const response = await apiClient.get('/api/condo/owners');
    return response.data;
  },

  async getOwnerById(id: string): Promise<Owner> {
    const response = await apiClient.get(`/api/condo/owners/${id}`);
    return response.data;
  },

  async createOwner(ownerData: Omit<Owner, 'id' | 'created_at' | 'updated_at'>): Promise<Owner> {
    const response = await apiClient.post('/api/condo/owners', ownerData);
    return response.data;
  },

  async updateOwner(id: string, ownerData: Partial<Owner>): Promise<Owner> {
    const response = await apiClient.put(`/api/condo/owners/${id}`, ownerData);
    return response.data;
  },

  async deleteOwner(id: string): Promise<void> {
    await apiClient.delete(`/api/condo/owners/${id}`);
  },
};