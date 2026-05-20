import React, { createContext, useContext, useEffect, useState } from 'react';
import { LangProps, langs } from '@/store/auth';
import translations from '@/locales/translations';
import { useStore } from '@/store';

// Типы для контекста
type TranslatorContextType = {
  t: (key: string) => string;
  currentLanguage: LangProps;
  setLanguage: (lang: LangProps) => void;
  availableLanguages: typeof langs;
};

// Создаем контекст
const TranslatorContext = createContext<TranslatorContextType | undefined>(
  undefined,
);

// Провайдер контекста
export const TranslatorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<LangProps>('en');
  const { authStore } = useStore(); // Используем ваш стор

  // Загружаем язык из хранилища при инициализации
  useEffect(() => {
    if (authStore.appLang && langs.includes(authStore.appLang)) {
      setCurrentLanguage(authStore.appLang);
    }
  }, [authStore.appLang]);

  // Рекурсивная функция для получения перевода по пути
  const t = (path: string): string => {
    const keys = path.split('.');
    let result: any = translations[currentLanguage];

    for (const key of keys) {
      if (!result) {
        break;
      }
      result = result[key];
    }

    return typeof result === 'string' ? result : path;
  };

  // Функция смены языка
  const setLanguage = (lang: LangProps) => {
    setCurrentLanguage(lang);
    authStore.setAppLang(lang); // Сохраняем в хранилище
  };

  return (
    <TranslatorContext.Provider
      value={{
        t,
        currentLanguage,
        setLanguage,
        availableLanguages: langs,
      }}
    >
      {children}
    </TranslatorContext.Provider>
  );
};

// Хук для использования контекста
export const useTranslator = () => {
  const context = useContext(TranslatorContext);
  if (!context) {
    throw new Error('useTranslator must be used within a TranslatorProvider');
  }
  return context;
};
