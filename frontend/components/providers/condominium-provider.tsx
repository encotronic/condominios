"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchUserCondominiums, type CondominiumItem } from "@/lib/api/auth.service";

interface CondominiumContextValue {
  condominiums: CondominiumItem[];
  isLoading: boolean;
  currentCondominiumId: string | null;
  setCurrentCondominiumId: (id: string | null) => void;
  refresh: () => Promise<void>;
}

const CondominiumContext = createContext<CondominiumContextValue | undefined>(undefined);

const STORAGE_KEY = "current_condominium_id";

export function CondominiumProvider({ children }: { children: React.ReactNode }) {
  const [condominiums, setCondominiums] = useState<CondominiumItem[]>([]);
  const [currentCondominiumId, setCurrentCondominiumIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCondominiums = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await fetchUserCondominiums();
      setCondominiums(items);

      const storedId = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (storedId && items.some((condo) => condo.id === storedId)) {
        setCurrentCondominiumIdState(storedId);
      } else if (items.length > 0) {
        setCurrentCondominiumIdState(items[0].id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, items[0].id);
        }
      } else {
        setCurrentCondominiumIdState(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error cargando condominios del usuario:", error);
      setCondominiums([]);
      setCurrentCondominiumIdState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCondominiums();
  }, [loadCondominiums]);

  const handleSetCurrent = useCallback((id: string | null) => {
    setCurrentCondominiumIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        window.localStorage.setItem(STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const value = useMemo<CondominiumContextValue>(() => ({
    condominiums,
    isLoading,
    currentCondominiumId,
    setCurrentCondominiumId: handleSetCurrent,
    refresh: loadCondominiums,
  }), [condominiums, currentCondominiumId, handleSetCurrent, isLoading, loadCondominiums]);

  return <CondominiumContext.Provider value={value}>{children}</CondominiumContext.Provider>;
}

export function useCondominiumContext(): CondominiumContextValue {
  const context = useContext(CondominiumContext);
  if (!context) {
    throw new Error("useCondominiumContext debe usarse dentro de un CondominiumProvider");
  }
  return context;
}
