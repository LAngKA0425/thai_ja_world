'use client'

export interface LocalBusiness {
  id: number
  name: string
  category: string
  region: string
  address: string
  priceRange: string
  description: string
  discount?: string
  isRecommended: boolean
  hasDiscount: boolean
  emoji: string
  phone?: string
  lineId?: string
  mapUrl?: string
  tags: string[]
}

interface LocalBusinessCardProps {
  business: LocalBusiness
}

export function LocalBusinessCard({ business }: LocalBusinessCardProps) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
      {/* Image / Placeholder */}
      <div className="relative w-full h-40 bg-gradient-to-br from-[#FAFAF8] to-gray-100 flex items-center justify-center">
        <span className="text-5xl">{business.emoji}</span>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {business.isRecommended && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#145A46] text-white text-[10px] font-bold rounded-full shadow-sm">
              ⭐ 운영자 추천
            </span>
          )}
          {business.hasDiscount && business.discount && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F2994A] text-white text-[10px] font-bold rounded-full shadow-sm">
              🎫 {business.discount}
            </span>
          )}
        </div>

        {/* Category Tag */}
        <span className="absolute top-2.5 right-2.5 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
          {business.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Region */}
        <div className="mb-2">
          <h3 className="text-[15px] font-bold text-[#1F2937] leading-snug mb-0.5">
            {business.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-[11px] text-[#9CA3AF]">{business.address}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-[#6B7280] leading-relaxed mb-3 line-clamp-2">
          {business.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {business.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-50 text-[10px] font-medium text-[#6B7280] rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold text-[#F2994A]">{business.priceRange}</span>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-[#145A46] font-bold rounded-full">
            {business.region}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#145A46] text-white text-[12px] font-bold rounded-xl hover:bg-[#0D4435] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              전화
            </a>
          )}
          {business.lineId && (
            <a
              href={`https://line.me/ti/p/${business.lineId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#06C755] text-white text-[12px] font-bold rounded-xl hover:bg-[#05B04C] transition-colors"
            >
              💬 라인 문의
            </a>
          )}
          {business.mapUrl && /^https?:\/\//.test(business.mapUrl) && (
            <a
              href={business.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-[#374151] text-[12px] font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              지도
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
