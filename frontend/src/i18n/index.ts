import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import he from './locales/he'
import ru from './locales/ru'

const saved = localStorage.getItem('lang') || 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
    ru: { translation: ru },
  },
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
