'use client'

import { useState } from 'react'

const tipCategories = [
  { key: 'incident', label: '사건', icon: '🚨' },
  { key: 'info', label: '정보', icon: '📢' },
  { key: 'food', label: '맛집', icon: '🍜' },
  { key: 'scam', label: '사기주의', icon: '⚠️' },
  { key: 'lifetip', label: '생활팁', icon: '💡' },
]

const regions = ['방콕', '파타야', '치앙마이', '푸켓', '후아힌', '기타']

export function TipSubmitForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !category || !region) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setIsOpen(false)
      setTitle('')
      setContent('')
      setCategory('')
      setRegion('')
    }, 2000)
  }

  if (!isOpen) {
    return (
      <section className="px-4 py-2 max-w-3xl mx-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-[#F2994A] to-[#F2C94C] text-white font-bold text-[14px] py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          실시간 제보하기
        </button>
      </section>
    )
  }

  return (
    <section className="px-4 py-2 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-[#F2994A]/10 to-[#F2C94C]/10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-[#1F2937]">익명 제보 작성</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#9CA3AF] text-lg hover:text-[#6B7280] transition-colors"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-[14px] font-bold text-[#1F2937]">제보가 접수되었습니다</p>
            <p className="text-[12px] text-[#6B7280] mt-1">관리자 검토 후 커뮤니티에 공유됩니다</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Category */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] mb-1.5 block">제보 유형</label>
              <div className="flex gap-1.5 flex-wrap">
                {tipCategories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                      category === c.key
                        ? 'bg-[#F2994A] text-white shadow-sm'
                        : 'bg-gray-50 text-[#6B7280] border border-gray-200'
                    }`}
                  >
                    <span>{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] mb-1.5 block">위치</label>
              <div className="flex gap-1.5 flex-wrap">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                      region === r
                        ? 'bg-[#F2C94C]/20 text-[#1F2937] border border-[#F2C94C]'
                        : 'bg-gray-50 text-[#9CA3AF] border border-gray-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] mb-1.5 block">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제보 제목을 입력하세요"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-[#1F2937] placeholder-[#D1D5DB] focus:outline-none focus:border-[#F2994A] focus:ring-1 focus:ring-[#F2994A]/20 transition-all"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] mb-1.5 block">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="제보 내용을 상세히 작성해주세요"
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-[#1F2937] placeholder-[#D1D5DB] focus:outline-none focus:border-[#F2994A] focus:ring-1 focus:ring-[#F2994A]/20 transition-all resize-none"
              />
            </div>

            {/* Photo upload placeholder */}
            <div>
              <label className="text-[11px] font-bold text-[#6B7280] mb-1.5 block">사진 첨부 (선택)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#F2994A]/30 transition-colors cursor-pointer">
                <p className="text-2xl mb-1">📷</p>
                <p className="text-[11px] text-[#9CA3AF]">사진을 추가하려면 탭하세요</p>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
                🔒 제보는 완전 익명이며, 개인정보는 수집하지 않습니다.
                관리자 검토 후 커뮤니티에 공유됩니다.
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || !category || !region}
              className={`w-full py-3 rounded-xl text-[13px] font-bold transition-all ${
                title.trim() && content.trim() && category && region
                  ? 'bg-[#F2994A] text-white hover:bg-[#E08A3A] active:scale-[0.98] shadow-sm'
                  : 'bg-gray-100 text-[#D1D5DB] cursor-not-allowed'
              }`}
            >
              제보 제출하기
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
