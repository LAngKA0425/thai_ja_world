'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const categoryColors: Record<string, string> = {
  briefing: 'bg-[#145A46] text-white',
  incident: 'bg-red-500 text-white',
  local_tip: 'bg-[#2563EB] text-white',
  visa_info: 'bg-[#2563EB] text-white',
  job: 'bg-[#7C3AED] text-white',
  market: 'bg-[#F2994A] text-white',
}

interface PostDetail {
  id: string
  authorId: string
  category: string
  categoryLabel: string
  title: string
  content: string
  author: string
  viewCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/community/posts/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(data => { setPost(data); setLoading(false) })
      .catch(() => { setError('게시글을 찾을 수 없습니다'); setLoading(false) })
  }, [params.id])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <p className="text-[#9CA3AF]">불러오는 중...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">📭</p>
        <p className="text-[#6B7280]">{error || '게시글을 찾을 수 없습니다'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[#145A46] text-white rounded-lg text-sm">
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="text-sm font-semibold text-[#1F2937]">게시글</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-5">
        <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Post Header */}
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${categoryColors[post.category] || 'bg-gray-500 text-white'}`}>
                {post.categoryLabel}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#1F2937] leading-snug mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#145A46] flex items-center justify-center text-white text-[10px] font-bold">
                  {post.author.charAt(0)}
                </div>
                <span className="font-medium text-[#6B7280]">{post.author}</span>
              </div>
              <span>{formatDate(post.createdAt)}</span>
              <span>조회 {post.viewCount?.toLocaleString()}</span>
              <span>댓글 {post.commentCount}</span>
            </div>
          </div>

          {/* Post Body */}
          <div className="p-5">
            <div className="prose prose-sm max-w-none text-[#374151] leading-relaxed whitespace-pre-wrap text-[15px]">
              {post.content}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-gray-50 flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-[12px] text-[#6B7280] hover:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              좋아요
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-[12px] text-[#6B7280] hover:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              공유
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-[12px] text-[#6B7280] hover:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              북마크
            </button>
          </div>
        </article>

        {/* Back to list */}
        <div className="mt-4 text-center">
          <Link href="/community" className="text-[13px] text-[#145A46] font-semibold hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  )
}
