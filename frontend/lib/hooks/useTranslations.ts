'use client';

import { useParams } from 'next/navigation';
import esMessages from '../../messages/es.json';
import enMessages from '../../messages/en.json';

type Messages = typeof esMessages;

const messages: Record<string, Messages> = {
  es: esMessages,
  en: enMessages,
};

export function useTranslations() {
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  
  const t = (key: string, values?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = messages[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if not found
      }
    }
    
    if (typeof value === 'string' && values) {
      return Object.entries(values).reduce(
        (str, [key, val]) => str.replace(`{${key}}`, String(val)),
        value
      );
    }
    
    return value || key;
  };
  
  return { t, locale };
}