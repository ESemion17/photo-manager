import { useState } from 'react'
import { IndexingPanel } from './components/IndexingPanel'
import { GalleryView } from './components/GalleryView'
import { SimilarityView } from './components/SimilarityView'
import { PersonsView } from './components/PersonsView'

type Tab = 'gallery' | 'similarity' | 'persons'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'gallery', label: 'גלריה', icon: '🖼️' },
  { id: 'similarity', label: 'תמונות דומות', icon: '🔍' },
  { id: 'persons', label: 'אנשים', icon: '👤' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('gallery')

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">📷 ניהול תמונות חכם</h1>
          <nav className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
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
