'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@/lib/hooks/useTranslations';

const locales = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
    setIsOpen(false);
  };

  const currentLocale = locales.find(l => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
      >
        <Globe className="w-5 h-5" />
        <span>{currentLocale?.flag}</span>
        <span className="hidden md:inline">{currentLocale?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-900/95 backdrop-blur-lg border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          {locales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => changeLanguage(loc.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                locale === loc.code 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="text-xl">{loc.flag}</span>
              <span className="font-medium">{loc.name}</span>
              {locale === loc.code && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}