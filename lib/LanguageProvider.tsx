"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getCurrentLanguage, setCurrentLanguage, t } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof import('@/lib/i18n').Translations) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('ar');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = getCurrentLanguage();
    setLanguageState(savedLanguage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setCurrentLanguage(lang);
  };

  const isRTL = language === 'ar';

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: (key) => t(key, language),
    isRTL,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-tajawal' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for easy translation
export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
