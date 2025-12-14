// Shared entity types used by frontend and backend (camelCase)

export interface Unit {
  id: string;
  code: string;
  floor?: number | null;
  area?: number | null;
  aliquotPercentage?: number; // decimal like 1.0
  // legacy snake_case compatibility (strings returned from backend)
  aliquot_percentage?: string;
  // active flag
  isActive?: boolean;
  is_active?: boolean;
  ownerId?: string;
  owner_id?: string;
  condominiumId?: string;
  condominium_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}
export interface Owner {
  id: string;
  userId?: string;
  user_id?: string;
  fullName?: string;
  full_name?: string;
  // legacy fields used across UI
  name?: string;
  address?: string;
  identification?: string;
  notes?: string;
  phone?: string;
  email?: string;
  unitId?: string;
  unit_id?: string;
  condominiumId?: string;
  condominium_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface Billing {
  id: string;
  name: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  amount?: number;
  status?: string;
}

export interface Payment {
  id: string;
  amount: number;
  referenceNumber?: string;
  reference_number?: string;
  paymentMethod?: string;
  payment_method?: string;
  paymentDate?: string; // ISO date
  payment_date?: string;
  unit?: Unit | null;
  billingPeriod?: { id: string; name: string } | null;
  billing_period?: { id: string; name: string } | null;
  // raw fields from backend may include snake_case; normalization helper will convert
}
