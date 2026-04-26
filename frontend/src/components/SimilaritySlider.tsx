import { useTranslation } from 'react-i18next'

interface Props {
  value: number
  onChange: (v: number) => void
}

export function SimilaritySlider({ value, onChange }: Props) {
  const { t } = useTranslation()

  const thresholds = [0, 2, 4, 6, 8, 10] as const
  const getLabel = (v: number) => {
    const key = [...thresholds].reverse().find(k => v >= k) ?? 0
    return t(`similarity.levels.${key}`)
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">{t('similarity.sliderTitle')}</h2>
        <span className="text-blue-400 font-bold text-xl">{value}</span>
      </div>
      <input
        type="range" min={0} max={10} step={0.5} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-blue-500 mb-2"
      />
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>{t('similarity.levelMin')}</span>
        <span>{t('similarity.levelMax')}</span>
      </div>
      <p className="text-sm text-slate-300 bg-slate-700 rounded-lg px-3 py-2">{getLabel(value)}</p>
    </div>
  )
}
