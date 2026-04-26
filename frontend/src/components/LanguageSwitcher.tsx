import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'he', label: 'עב', flag: '🇮🇱' },
  { code: 'ru', label: 'РУ', flag: '🇷🇺' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const change = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    document.documentElement.dir = code === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

  return (
    <div className="flex gap-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => change(lang.code)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title={lang.flag}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  )
}
