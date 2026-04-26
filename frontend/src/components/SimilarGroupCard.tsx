import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SimilarityGroup, similarityApi } from '../api'

interface Props {
  group: SimilarityGroup
  onResolved: () => void
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export function SimilarGroupCard({ group, onResolved }: Props) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Set<number>>(new Set(group.photos.map(p => p.photoId)))
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) { if (next.size === 1) return prev; next.delete(id) }
      else next.add(id)
      return next
    })
  }

  const resolve = async () => {
    setLoading(true)
    try { await similarityApi.resolveGroup(group.id, [...selected]); onResolved() }
    catch { alert(t('similarity.resolveError')) }
    finally { setLoading(false) }
  }

  const keepBest = () => {
    const best = [...group.photos].sort((a, b) => b.fileSize - a.fileSize)[0]
    setSelected(new Set([best.photoId]))
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-slate-400">
          {t('similarity.score', { score: group.similarityScore.toFixed(1) })}
          {' '}• {t('similarity.photos', { count: group.photos.length })}
        </span>
        <div className="flex gap-2">
          <button onClick={keepBest} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg transition-colors">
            {t('similarity.keepLargest')}
          </button>
          <button onClick={resolve} disabled={loading} className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-1 rounded-lg transition-colors">
            {loading ? '...' : t('similarity.confirm')}
          </button>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${group.photos.length}, 1fr)` }}>
        {group.photos.map(photo => {
          const isKept = selected.has(photo.photoId)
          return (
            <div
              key={photo.photoId}
              onClick={() => toggle(photo.photoId)}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isKept ? 'border-green-500' : 'border-red-500 opacity-50'}`}
            >
              <img
                src={`http://localhost:5000${photo.thumbnailUrl}`}
                alt={photo.fileName}
                className="w-full aspect-square object-cover"
                onClick={e => { e.stopPropagation(); setExpanded(photo.photoId === expanded ? null : photo.photoId) }}
              />
              <div className={`absolute top-2 right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ${isKept ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {isKept ? '✓' : '✕'}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs p-1 text-center text-white truncate">
                {formatBytes(photo.fileSize)}
              </div>
            </div>
          )
        })}
      </div>

      {expanded !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setExpanded(null)}>
          <img src={`http://localhost:5000/api/photos/${expanded}/image`} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </div>
  )
}
