'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'

/* ── mock data ── */
const boards = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유게시판' },
  { key: 'info', label: '정보공유' },
  { key: 'qna', label: '질문' },
  { key: 'life', label: '생활' },
  { key: 'job', label: '구인구직' },
]

const latestPosts = [
  { id: 1, board: '자유게시판', boardColor: 'text-[#145A46]', title: '방콕 아속역 근처 카페 추천 부탁드려요', author: '방콕살이', time: '10분 전', comments: 12, views: 89, region: '방콕', hasImage: false },
  { id: 2, board: '정보공유', boardColor: 'text-[#2563EB]', title: '태국 운전면허 한국면허로 교환하는 법 정리', author: '치앙마이교민', time: '32분 전', comments: 24, views: 215, region: '치앙마이', hasImage: true },
  { id: 3, board: '질문', boardColor: 'text-[#F2994A]', title: '파타야에서 한국 택배 받으신 분 계신가요?', author: '파타야뉴비', time: '1시간 전', comments: 8, views: 67, region: '파타야', hasImage: false },
  { id: 4, board: '자유게시판', boardColor: 'text-[#145A46]', title: '태국 생활 3년차, 알게 된 것들 공유합니다', author: '태국선배', time: '2시간 전', comments: 45, views: 823, region: '방콕', hasImage: true },
  { id: 5, board: '정보공유', boardColor: 'text-[#2563EB]', title: '2026년 태국 공휴일 캘린더 정리', author: '운영자', time: '3시간 전', comments: 18, views: 412, region: '전체', hasImage: false },
  { id: 6, board: '생활', boardColor: 'text-[#7C3AED]', title: '방콕 콘도 월세 시세 정리 (2026년 3월)', author: '부동산탐험', time: '4시간 전', comments: 33, views: 567, region: '방콕', hasImage: false },
  { id: 7, board: '질문', boardColor: 'text-[#F2994A]', title: '태국에서 건강검진 받을 수 있는 곳?', author: '건강맨', time: '5시간 전', comments: 15, views: 201, region: '방콕', hasImage: false },
  { id: 8, board: '자유게시판', boardColor: 'text-[#145A46]', title: '오늘 수완나폼 입국심사 30분 걸렸네요', author: '여행자A', time: '6시간 전', comments: 9, views: 145, region: '방콕', hasImage: false },
]

const popularPosts = [
  { id: 1, rank: 1, title: '태국에서 한국 넷플릭스 보는 3가지 방법', comments: 87, views: 2341, badge: '🔥' },
  { id: 2, rank: 2, title: '방콕 한인마트 가격 비교 총정리 (2026년 3월)', comments: 54, views: 1892, badge: '🔥' },
  { id: 3, rank: 3, title: '태국 은행 계좌 개설 후기 - 카시콘 vs 방콕뱅크', comments: 42, views: 1456, badge: null },
  { id: 4, rank: 4, title: '수완나폼 공항에서 시내까지 가장 싼 방법', comments: 38, views: 1203, badge: null },
  { id: 5, rank: 5, title: '태국 생활비 현실 - 월 얼마면 될까?', comments: 31, views: 987, badge: null },
]

const hotComments = [
  { id: 1, title: '태국 비자런 금지 루머... 진짜인가요?', comments: 112, board: '질문' },
  { id: 2, title: '방콕 vs 치앙마이, 어디가 더 살기 좋나요?', comments: 89, board: '자유게시판' },
  { id: 3, title: '태국에서 자녀 교육 어떻게 하시나요?', comments: 76, board: '생활' },
]

const regionTags = ['전체', '방콕', '파타야', '치앙마이', '푸켓', '후아힌', '코사무이']

export default function CommunityPage() {
  const [selectedBoard, setSelectedBoard] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('전체')

  const filteredPosts = selectedBoard === 'all'
    ? latestPosts
    : latestPosts.filter((p) => {
        const map: Record<string, string> = { free: '자유게시판', info: '정보공유', qna: '질문', life: '생활', job: '구인구직' }
        return p.board === map[selectedBoard]
      })

  const regionFiltered = selectedRegion === '전체'
    ? filteredPosts
    : filteredPosts.filter((p) => p.region === selectedRegion)

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

        {/* Region Tags */}
        <section className="px-4 pb-2 max-w-3xl mx-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {regionTags.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedRegion === r
                    ? 'bg-[#F2C94C]/20 text-[#1F2937] border border-[#F2C94C]'
                    : 'bg-gray-50 text-[#9CA3AF] hover:bg-gray-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        <div className="h-2 bg-gray-50"></div>

        {/* Popular Posts */}
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
              <article key={post.id} className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${idx !== popularPosts.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className={`text-sm font-black w-6 text-center ${post.rank <= 3 ? 'text-[#145A46]' : 'text-[#D1D5DB]'}`}>{post.rank}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold text-[#1F2937] line-clamp-1">
                    {post.badge && <span className="mr-1">{post.badge}</span>}{post.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] flex-shrink-0">
                  <span>조회 {post.views.toLocaleString()}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="h-2 bg-gray-50"></div>

        {/* Hot Comments */}
        <section className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
              <span className="w-1.5 h-5 bg-red-400 rounded-full inline-block"></span>
              댓글 많은 글
            </h3>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {hotComments.map((hc) => (
              <article key={hc.id} className="min-w-[200px] bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:shadow-sm transition-shadow flex-shrink-0">
                <span className="text-[10px] font-bold text-[#145A46] mb-1 block">{hc.board}</span>
                <h4 className="text-[12px] font-semibold text-[#1F2937] line-clamp-2 mb-2">{hc.title}</h4>
                <span className="text-[10px] text-[#F2994A] font-bold">💬 {hc.comments}개 댓글</span>
              </article>
            ))}
          </div>
        </section>

        <div className="h-2 bg-gray-50"></div>

        {/* Latest Posts */}
        <section className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-1.5">
              <span className="w-1.5 h-5 bg-[#145A46] rounded-full inline-block"></span>
              최신 글
            </h3>
            <span className="text-[10px] text-[#9CA3AF]">{regionFiltered.length}개 글</span>
          </div>

          <div className="space-y-1">
            {regionFiltered.map((post) => (
              <article key={post.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/50 -mx-1 px-1 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-bold ${post.boardColor}`}>{post.board}</span>
                    <span className="text-[10px] text-[#D1D5DB]">·</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 rounded text-[#9CA3AF] font-medium">{post.region}</span>
                  </div>
                  <h4 className="text-[13px] font-semibold text-[#1F2937] leading-snug line-clamp-1 mb-0.5">{post.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                    <span>{post.author}</span><span>·</span><span>{post.time}</span><span>·</span><span>조회 {post.views}</span><span>·</span><span>댓글 {post.comments}</span>
                  </div>
                </div>
                {post.hasImage && (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-300">IMG</div>
                )}
              </article>
            ))}

            {regionFiltered.length === 0 && (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-[13px] text-[#6B7280]">해당 조건에 맞는 글이 없습니다</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <HomeBottomNav />
    </div>
  )
}
