'use client'

interface LocalCategoryFilterProps {
  selected: string
  onSelect: (cat: string) => void
}

const categories = [
  { key: 'all', label: '전체', icon: '🔥' },
  { key: 'massage', label: '마사지', icon: '💆' },
  { key: 'restaurant', label: '맛집', icon: '🍜' },
  { key: 'mookata', label: '무까따', icon: '🥘' },
  { key: 'cafe', label: '카페', icon: '☕' },
  { key: 'service', label: '서비스', icon: '🔧' },
]

export function LocalCategoryFilter({ selected, onSelect }: LocalCategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            selected === cat.key
              ? 'bg-[#145A46] text-white shadow-sm'
              : 'bg-white text-[#6B7280] border border-gray-200 hover:border-[#145A46]/30'
          }`}
        >
          <span className="text-base">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  )
}
