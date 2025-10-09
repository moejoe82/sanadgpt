"use client";

import { useLanguage } from '@/lib/LanguageProvider';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span className="text-sm font-medium">
        {language === 'ar' ? 'EN' : 'عربي'}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {language === 'ar' ? '🇺🇸' : '🇸🇦'}
      </span>
    </button>
  );
}

export default LanguageToggle;
