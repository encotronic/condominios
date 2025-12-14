"use client";

import React from 'react';
import { useCondominiumContext } from '@/components/providers/condominium-provider';
import { Building } from 'lucide-react';

export default function CondominiumSwitcher() {
  const { condominiums, isLoading, currentCondominiumId, setCurrentCondominiumId } = useCondominiumContext();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || null;
    setCurrentCondominiumId(val);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2">
        <Building className="w-5 h-5 text-gray-500" />
        <div className="text-sm text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!condominiums || condominiums.length === 0) {
    return (
      <div className="flex items-center gap-2 px-2">
        <Building className="w-5 h-5 text-gray-400" />
        <div className="text-sm text-gray-500">Sin condominios</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building className="w-5 h-5 text-gray-600" />
      <select
        value={currentCondominiumId ?? ''}
        onChange={handleChange}
        className="text-sm border rounded-md px-2 py-1 bg-white dark:bg-gray-800"
        aria-label="Seleccionar condominio"
      >
        {condominiums.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
