type DashboardStrings = {
  welcome: string;
  totalUnits: string;
  collectionRate: string;
};

const dashboardObj: DashboardStrings = {
  welcome: 'Bienvenido',
  totalUnits: 'Total unidades',
  collectionRate: 'Tasa de cobranza',
};

export const useTranslation = () => {
  return {
    t: (key: string) => {
      if (key === 'dashboard') return dashboardObj;
      // support nested keys like 'dashboard.welcome'
      if (key.startsWith('dashboard.')) {
        const k = key.split('.').slice(1).join('.');
        // @ts-ignore
        return (dashboardObj as any)[k] ?? key;
      }
      return key;
    },
    locale: 'es',
  } as const;
};

export const useTranslations = () => {
  return {
    t: (key: string) => {
      if (key === 'dashboard') return dashboardObj;
      if (key.startsWith('dashboard.')) {
        const k = key.split('.').slice(1).join('.');
        // @ts-ignore
        return (dashboardObj as any)[k] ?? key;
      }
      return key;
    },
    locale: 'es',
  } as const;
};

export default useTranslation;
