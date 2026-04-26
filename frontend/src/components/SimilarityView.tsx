import { useState } from 'react'
import { SimilaritySlider } from './SimilaritySlider'
import { SimilarGroupCard } from './SimilarGroupCard'
import { SimilarityGroup, similarityApi } from '../api'

export function SimilarityView() {
  const [level, setLevel] = useState(3)
  const [groups, setGroups] = useState<SimilarityGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    setLoading(true)
    try {
      const data = await similarityApi.getGroups(level)
      setGroups(data.groups)
      setSearched(true)
    } catch {
      alert('שגיאה בחיפוש תמונות דומות')
    } finally {
      setLoading(false)
    }
  }

  const removeGroup = (id: number) => {
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  const bulkResolve = async () => {
    if (!confirm(`מחיקה אוטומטית של כפולות מתוך ${groups.length} קבוצות? (ישמר הקובץ הגדול ביותר בכל קבוצה)`)) return
    try {
      await similarityApi.bulkResolve(groups.map(g => g.id))
      setGroups([])
    } catch {
      alert('שגיאה בטיפול הגורף')
    }
  }

  return (
    <div>
      <SimilaritySlider value={level} onChange={setLevel} />

      <div className="flex gap-3 mb-6">
        <button
          onClick={search}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'מחפש...' : 'חפש תמונות דומות'}
        </button>
        {groups.length > 0 && (
          <button
            onClick={bulkResolve}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            מחק כפולות אוטומטית ({groups.length} קבוצות)
          </button>
        )}
      </div>

      {searched && groups.length === 0 && (
        <div className="text-center text-slate-400 py-12">
          לא נמצאו תמונות דומות ברמה {level}
        </div>
      )}

      {groups.length > 0 && (
        <p className="text-slate-400 text-sm mb-4">
          נמצאו <span className="text-white font-bold">{groups.length}</span> קבוצות של תמונות דומות
          <span className="text-slate-500 mr-2">• לחץ על תמונה לסמן למחיקה (אדום) / שמירה (ירוק)</span>
        </p>
      )}

      {groups.map(group => (
        <SimilarGroupCard
          key={group.id}
          group={group}
          onResolved={() => removeGroup(group.id)}
        />
      ))}
    </div>
  )
}
