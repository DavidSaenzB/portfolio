"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/locales/en';
import { es } from '@/locales/es';

type LanguageContextType = {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
  dict: typeof es;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<'es' | 'en'>('es'); // Default is ES

  useEffect(() => {
    // Load from localStorage if exists
    const storedLang = localStorage.getItem('portfolio-lang') as 'es' | 'en';
    if (storedLang === 'es' || storedLang === 'en') {
        setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: 'es' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('portfolio-lang', lang);
  };

  const dict = language === 'en' ? en : es;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, dict }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
