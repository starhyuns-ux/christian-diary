'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations['ko']) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko')

  useEffect(() => {
    const savedLang = localStorage.getItem('christian-diary-lang') as Language
    if (savedLang && Object.keys(translations).includes(savedLang)) {
      setLanguageState(savedLang)
    } else {
      // 브라우저 언어 감지 (기본값 ko)
      const browserLang = navigator.language.split('-')[0]
      if (Object.keys(translations).includes(browserLang)) {
        setLanguageState(browserLang as Language)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('christian-diary-lang', lang)
  }

  const t = (key: keyof typeof translations['ko']): string => {
    return translations[language][key] || translations['ko'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
