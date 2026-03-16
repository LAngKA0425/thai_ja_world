'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'

interface PostItem {
  id: string
  category: string
  categoryLabel: string
  title: string
  summary: string
  content: string
  author: string
  time: string
  comments: number
  views: number
}

/* ── 게시판 탭 ── */
const boards = [
  { key: 'all', label: '전체' },
  { key: 'briefing', label: '뉴스' },
  { key: 'local_tip', label: '생활정보' },
  { key: 'visa_info', label: '비자정보' },
  { key: 'incident', label: '사건사고' },
  { key: 'job', label: '구인구직' },
]

const boardColorMap: Record<string, string> = {
  briefing: 'text-[#145A46]',
  local_tip: 'text-[#2563EB]',
  visa_info: 'text-[#2563EB]',
  incident: 'text-red-500',
  job: 'text-[#7C3AED]',
  market: 'text-[#F2994A]',
}

export default function CommunityPage() {
  const [selectedBoard, setSelectedBoard] = useState('all')
  const [posts, setPosts] = useState<PostItem[]>([])
  const [popularPosts, setPopularPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cat = selectedBoard === 'all' ? '' : `&category=${selectedBoard}`
    setLoading(true)
    fetch(`/api/community/posts?limit=30&sort=latest${cat}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedBoard])

  useEffect(() => {
    fetch('/api/community/posts?section=popular&limit=5')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPopularPosts(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-safe-top">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#1F2937]">💬 커뮤니티</h1>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button className="px-3.5 py-1.5 bg-[#145A46] text-white text-[12px] font-bold rounded-full hover:bg-[#0D4435] transition-colors">
              글쓰기
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Board Tabs */}
        <section className="px-4 pt-3 pb-1 max-w-3xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {boards.map((b) => (
              <button
                key={b.key}
                onClick={() => setSelectedBoard(b.key)}
                className={`px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                  selectedBoard === b.key
                    ? 'bg-[#145A46] text-white shadow-sm'
                    : 'bg-white text-[#6B7280] border border-gray-200 hover:border-[#145A46]/30'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </section>

        <div className="h-2 bg-gray-50"></div>

        {/* Popular Posts */}
        {popularPosts.length > 0 && (
          <section className="px-4 py-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
                <span className="w-1.5 h-5 bg-[#F2994A] rounded-full inline-block"></span>
                오늘 인기글
              </h3>
              <span className="text-[10px] text-[#9CA3AF] bg-gray-50 px-2 py-0.5 rounded-full">조회수 기준</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {popularPosts.map((post, idx) => (
                <Link key={post.id} href={`/community/${post.id}`} className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${idx !== popularPosts.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className={`text-sm font-black w-6 text-center ${idx < 3 ? 'text-[#145A46]' : 'text-[#D1D5DB]'}`}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-semibold text-[#1F2937] line-clamp-1">
                      {idx < 2 && <span className="mr-1">🔥</span>}{post.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] flex-shrink-0">
                    <span>조회 {post.views.toLocaleString()}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="h-2 bg-gray-50"></div>

        {/* Latest Posts */}
        <section className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
              <span className="w-1.5 h-5 bg-[#145A46] rounded-full inline-block"></span>
              최신 글
            </h3>
            <span className="text-[10px] text-[#9CA3AF]">{posts.length}개 글</span>
          </div>

          {loading ? (
            <p className="text-center text-[#9CA3AF] text-sm py-8">불러오는 중...</p>
          ) : (
            <div className="space-y-1">
              {posts.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/50 -mx-1 px-1 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[10px] font-bold ${boardColorMap[post.category] || 'text-[#145A46]'}`}>{post.categoryLabel}</span>
                    </div>
                    <h4 className="text-[13px] font-semibold text-[#1F2937] leading-snug line-clamp-1 mb-0.5">{post.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                      <span>{post.author}</span><span>·</span><span>{post.time}</span><span>·</span><span>조회 {post.views}</span><span>·</span><span>댓글 {post.comments}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {posts.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-[13px] text-[#6B7280]">해당 카테고리에 글이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <HomeBottomNav />
    </div>
  )
}
