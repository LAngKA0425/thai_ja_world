'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PostItem {
  id: string
  categoryLabel: string
  title: string
  author: string
  time: string
  comments: number
  views: number
  category: string
}

const categoryColorMap: Record<string, string> = {
  briefing: 'text-[#145A46]',
  local_tip: 'text-[#2563EB]',
  visa_info: 'text-[#2563EB]',
  incident: 'text-red-500',
  job: 'text-[#7C3AED]',
  market: 'text-[#F2994A]',
}

export function LatestPosts() {
  const [posts, setPosts] = useState<PostItem[]>([])

  useEffect(() => {
    fetch('/api/community/posts?limit=10&sort=latest')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
      .catch(() => {})
  }, [])

  if (posts.length === 0) {
    return (
      <section className="px-4 py-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
            <span className="w-1.5 h-5 bg-[#F2C94C] rounded-full inline-block"></span>
            최신 커뮤니티 글
          </h3>
        </div>
        <p className="text-center text-[#9CA3AF] text-sm py-8">게시글을 불러오는 중...</p>
      </section>
    )
  }

  return (
    <section className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
          <span className="w-1.5 h-5 bg-[#F2C94C] rounded-full inline-block"></span>
          최신 커뮤니티 글
        </h3>
        <Link href="/community" className="text-xs text-[#6B7280] font-medium hover:text-[#145A46] transition-colors">
          더보기 →
        </Link>
      </div>

      <div className="space-y-1">
        {posts.map((post) => (
          <article
            key={post.id}
            className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/50 -mx-1 px-1 rounded-lg transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[10px] font-bold ${categoryColorMap[post.category] || 'text-[#145A46]'}`}>
                  {post.categoryLabel}
                </span>
              </div>
              <h4 className="text-[13px] font-semibold text-[#1F2937] leading-snug line-clamp-1 mb-0.5">
                {post.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                <span>{post.author}</span>
                <span>·</span>
                <span>{post.time}</span>
                <span>·</span>
                <span>조회 {post.views}</span>
                <span>·</span>
                <span>댓글 {post.comments}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
