import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { photosApi } from '../api'
import { FolderPicker } from './FolderPicker'

type Status = { isIndexing: boolean; processed: number; total: number; currentFile: string }

export function IndexingPanel() {
  const { t } = useTranslation()
  const [folder, setFolder] = useState('')
  const [status, setStatus] = useState<Status | null>(null)
  const [backendUp, setBackendUp] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
  }

  const startPolling = () => {
    stopPolling()
    pollingRef.current = setInterval(async () => {
      try {
        const s = await photosApi.indexingStatus()
        setBackendUp(true); setStatus(s)
        if (!s.isIndexing) stopPolling()
      } catch { setBackendUp(false); stopPolling() }
    }, 1000)
  }

  useEffect(() => {
    photosApi.indexingStatus()
      .then(s => { setBackendUp(true); setStatus(s); if (s.isIndexing) startPolling() })
      .catch(() => setBackendUp(false))
    return stopPolling
  }, [])

  const startIndexing = async () => {
    if (!folder.trim()) return
    try { await photosApi.startIndexing(folder.trim()); startPolling() }
    catch (e: any) { alert(e.response?.data || 'Failed to start indexing') }
  }

  const progress = status && status.total > 0 ? (status.processed / status.total) * 100 : 0

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-white">{t('indexing.title')}</h2>

      {!backendUp && (
        <p className="text-red-400 text-sm mb-3">{t('indexing.backendDown')}</p>
      )}

      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none"
          placeholder={t('indexing.placeholder')}
          value={folder}
          onChange={e => setFolder(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && startIndexing()}
          dir="ltr"
        />
        <button
          onClick={() => setPickerOpen(true)}
          disabled={!backendUp}
          className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
          title="Browse"
        >
          📂
        </button>
        <button
          onClick={startIndexing}
          disabled={status?.isIndexing || !backendUp}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {status?.isIndexing ? t('indexing.scanning') : t('indexing.startButton')}
        </button>
      </div>

      {status?.isIndexing && (
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span className="truncate">{status.currentFile}</span>
            <span className="shrink-0 ml-4">{status.processed.toLocaleString()} / {status.total.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status && !status.isIndexing && status.processed > 0 && (
        <p className="text-green-400 text-sm">✓ {t('indexing.done', { count: status.processed.toLocaleString() })}</p>
      )}

      {pickerOpen && (
        <FolderPicker
          onSelect={path => { setFolder(path); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
