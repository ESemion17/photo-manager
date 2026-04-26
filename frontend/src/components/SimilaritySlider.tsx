interface Props {
  value: number
  onChange: (v: number) => void
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'זהות מוחלטת',
  2: 'כפולות (crop/resize)',
  4: 'כפולות עם דחיסה שונה',
  6: 'אותה סצנה, זווית שונה',
  8: 'אותו אירוע',
  10: 'אותם אנשים, מיקום דומה',
}

function getLabel(v: number) {
  const keys = Object.keys(LEVEL_LABELS).map(Number).sort((a, b) => b - a)
  for (const k of keys) {
    if (v >= k) return LEVEL_LABELS[k]
  }
  return ''
}

export function SimilaritySlider({ value, onChange }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">רמת דמיון לחיפוש</h2>
        <span className="text-blue-400 font-bold text-xl">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-blue-500 mb-2"
      />
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>0 — זהה לחלוטין</span>
        <span>10 — דומה מאוד</span>
      </div>
      <p className="text-sm text-slate-300 bg-slate-700 rounded-lg px-3 py-2">
        {getLabel(value)}
      </p>
    </div>
  )
}
