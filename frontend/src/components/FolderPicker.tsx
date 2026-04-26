import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api'

interface FsEntry { path: string; name: string; hasChildren: boolean }
interface BrowseResult { current: string; parent: string | null; entries: FsEntry[] }
interface Props { onSelect: (path: string) => void; onClose: () => void }

export function FolderPicker({ onSelect, onClose }: Props) {
  const { t } = useTranslation()
  const [data, setData] = useState<BrowseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const browse = async (path?: string) => {
    setLoading(true); setError('')
    try {
      const res = await api.get<BrowseResult>('/filesystem/browse', { params: path ? { path } : {} })
      setData(res.data)
    } catch { setError(t('folderPicker.error')) }
    finally { setLoading(false) }
  }

  useEffect(() => { browse() }, [])

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl w-full max-w-lg mx-4 flex flex-col" style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">{t('folderPicker.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        {data?.current && (
          <div className="px-5 py-2 bg-slate-900 text-sm text-slate-400 font-mono truncate" dir="ltr">{data.current}</div>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading && <p className="text-center text-slate-500 py-8">{t('folderPicker.loading')}</p>}
          {error && <p className="text-center text-red-400 py-8">{error}</p>}

          {!loading && data && (
            <>
              {data.parent !== null && (
                <button onClick={() => browse(data.parent ?? undefined)} className="w-full text-left px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700 flex items-center gap-3 transition-colors">
                  <span className="text-lg">↑</span>
                  <span className="text-sm">{t('folderPicker.up')}</span>
                </button>
              )}
              {data.entries.length === 0 && <p className="text-center text-slate-500 py-6 text-sm">{t('folderPicker.empty')}</p>}
              {data.entries.map(entry => (
                <button key={entry.path} onClick={() => browse(entry.path)} className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-700 flex items-center gap-3 transition-colors group" dir="ltr">
                  <span className="text-yellow-400 text-lg shrink-0">📁</span>
                  <span className="flex-1 text-white text-sm truncate">{entry.name}</span>
                  {entry.hasChildren && <span className="text-slate-500 group-hover:text-slate-300 text-xs">›</span>}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-700 flex justify-between items-center gap-3">
          <span className="text-sm text-slate-400 truncate" dir="ltr">{data?.current || t('folderPicker.currentPath')}</span>
          <div className="flex gap-2 shrink-0">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm transition-colors">{t('folderPicker.cancel')}</button>
            <button onClick={() => data?.current && onSelect(data.current)} disabled={!data?.current} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
              {t('folderPicker.select')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
