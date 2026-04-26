import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IndexingPanel } from './components/IndexingPanel'
import { GalleryView } from './components/GalleryView'
import { SimilarityView } from './components/SimilarityView'
import { PersonsView } from './components/PersonsView'
import { LanguageSwitcher } from './components/LanguageSwitcher'

type Tab = 'gallery' | 'similarity' | 'persons'
const ICONS: Record<Tab, string> = { gallery: '🖼️', similarity: '🔍', persons: '👤' }

export default function App() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState<Tab>('gallery')
  const isRtl = i18n.language === 'he'

  return (
    <div className="min-h-screen bg-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white shrink-0">📷 {t('appTitle')}</h1>

          <nav className="flex gap-1">
            {(['gallery', 'similarity', 'persons'] as Tab[]).map(id => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {ICONS[id]} {t(`tabs.${id}`)}
              </button>
            ))}
          </nav>

          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <IndexingPanel />
        {tab === 'gallery' && <GalleryView />}
        {tab === 'similarity' && <SimilarityView />}
        {tab === 'persons' && <PersonsView />}
      </main>
    </div>
  )
}
