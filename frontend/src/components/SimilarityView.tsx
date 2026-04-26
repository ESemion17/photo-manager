import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SimilaritySlider } from './SimilaritySlider'
import { SimilarGroupCard } from './SimilarGroupCard'
import { SimilarityGroup, similarityApi } from '../api'

export function SimilarityView() {
  const { t } = useTranslation()
  const [level, setLevel] = useState(3)
  const [groups, setGroups] = useState<SimilarityGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    setLoading(true)
    try { const data = await similarityApi.getGroups(level); setGroups(data.groups); setSearched(true) }
    catch { alert('Error searching for similar photos') }
    finally { setLoading(false) }
  }

  const bulkResolve = async () => {
    if (!confirm(t('similarity.bulkConfirm', { count: groups.length }))) return
    try { await similarityApi.bulkResolve(groups.map(g => g.id)); setGroups([]) }
    catch { alert(t('similarity.bulkError')) }
  }

  return (
    <div>
      <SimilaritySlider value={level} onChange={setLevel} />

      <div className="flex gap-3 mb-6">
        <button onClick={search} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          {loading ? t('similarity.searching') : t('similarity.searchButton')}
        </button>
        {groups.length > 0 && (
          <button onClick={bulkResolve} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            {t('similarity.bulkDelete', { count: groups.length })}
          </button>
        )}
      </div>

      {searched && groups.length === 0 && (
        <div className="text-center text-slate-400 py-12">
          {t('similarity.noResults', { level })}
        </div>
      )}

      {groups.length > 0 && (
        <p className="text-slate-400 text-sm mb-4"
          dangerouslySetInnerHTML={{ __html: t('similarity.groupsFound', { count: groups.length }) + ' ' + t('similarity.groupsHint') }}
        />
      )}

      {groups.map(group => (
        <SimilarGroupCard key={group.id} group={group} onResolved={() => setGroups(prev => prev.filter(g => g.id !== group.id))} />
      ))}
    </div>
  )
}
