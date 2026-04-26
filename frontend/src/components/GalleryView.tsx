import { useState, useEffect } from 'react'
import { Photo, photosApi } from '../api'

export function GalleryView() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const load = async (p: number) => {
    setLoading(true)
    try {
      const data = await photosApi.list(p)
      setPhotos(data.photos)
      setTotal(data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  const deletePhoto = async (id: number) => {
    if (!confirm('העבר לאשפה?')) return
    await photosApi.softDelete(id)
    setPhotos(prev => prev.filter(p => p.id !== id))
    setTotal(prev => prev - 1)
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-400 text-sm">{total.toLocaleString()} תמונות</p>
        {loading && <span className="text-blue-400 text-sm">טוען...</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {photos.map(photo => (
          <div
            key={photo.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square bg-slate-800"
            onClick={() => setSelected(photo.id === selected ? null : photo.id)}
          >
            <img
              src={`http://localhost:5000${photo.thumbnailUrl}`}
              alt={photo.fileName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {photo.faces.length > 0 && (
              <div className="absolute top-1 left-1 bg-black/60 rounded-full px-1.5 text-xs text-white">
                {photo.faces.map(f => f.personName).filter(Boolean).join(', ') || `${photo.faces.length} פנים`}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={e => { e.stopPropagation(); deletePhoto(photo.id) }}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
                title="מחק"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => load(page - 1)}
          disabled={page === 1 || loading}
          className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 rounded-lg"
        >
          ← קודם
        </button>
        <span className="px-4 py-2 text-slate-400">{page} / {totalPages}</span>
        <button
          onClick={() => load(page + 1)}
          disabled={page === totalPages || loading}
          className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 rounded-lg"
        >
          הבא →
        </button>
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <img
            src={`http://localhost:5000/api/photos/${selected}/image`}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  )
}
