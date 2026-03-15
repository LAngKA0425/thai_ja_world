'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { GuestbookForm } from '@/components/minihome/GuestbookForm'
import { GuestbookList } from '@/components/minihome/GuestbookList'
import { MinihomePhotos } from '@/components/minihome/MinihomePhotos'
import { MinihomePosts } from '@/components/minihome/MinihomePosts'
import { MinihomeFriendComments } from '@/components/minihome/MinihomeFriendComments'
import { useMinihome } from '@/hooks/useMinihome'
import { t } from '@/lib/i18n'

interface PageProps {
  params: {
    userId: string
  }
}

type Tab = 'home' | 'guestbook' | 'photos' | 'posts' | 'friends'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'guestbook', label: '방명록', icon: '📖' },
  { key: 'photos', label: '사진첩', icon: '📸' },
  { key: 'posts', label: '게시글', icon: '✏️' },
  { key: 'friends', label: '일촌평', icon: '💛' },
]

export default function MinihomePage({ params }: PageProps) {
  const router = useRouter()
  const { user: currentUser, token } = useAuthStore()
  const minihome = useMinihome(params.userId)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isAddingGuestbook, setIsAddingGuestbook] = useState(false)

  useEffect(() => {
    if (params.userId !== currentUser?.id) {
      minihome.incrementVisitorCount()
    }
  }, [params.userId, currentUser?.id])

  const handleAddGuestbook = async (content: string) => {
    try {
      setIsAddingGuestbook(true)
      await minihome.addGuestbookEntry(content)
      alert(t('minihome.guestbookAddSuccess'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('minihome.guestbookAddError'))
    } finally {
      setIsAddingGuestbook(false)
    }
  }

  const handleDeleteGuestbook = async (entryId: string) => {
    if (!confirm(t('minihome.guestbookDeleteConfirm'))) return

    try {
      await minihome.deleteGuestbookEntry(entryId)
      alert(t('minihome.guestbookDeleteSuccess'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('minihome.guestbookDeleteError'))
    }
  }

  if (minihome.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F7F4] to-[#FAFAF8] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#145A46] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#6B7280]">{t('minihome.loading')}</p>
        </div>
      </div>
    )
  }

  const fallbackData = {
    id: `minihome-${params.userId}`,
    userId: params.userId,
    nickname: currentUser?.nickname || '사용자',
    avatar: currentUser?.avatar,
    character: currentUser?.character,
    visitorCount: 0,
    isOnline: true,
    createdAt: currentUser?.createdAt || new Date().toISOString(),
    bio: '',
    bgmName: '',
    skinName: '',
  }

  const data = minihome.minihomeData || fallbackData
  const todayDate = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7F4] via-[#F7FAF8] to-[#FAFAF8]">
      {/* === Top Bar === */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8F5E9]">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[13px] text-[#6B7280] hover:text-[#145A46] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>돌아가기</span>
          </button>
          <h1 className="text-[13px] font-bold text-[#1F2937]">
            {data.nickname}님의 미니홈피
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* === Profile Hero Section === */}
      <section className="max-w-2xl mx-auto px-4 pt-5 pb-3">
        <div className="relative bg-white rounded-2xl border border-[#E8F5E9] overflow-hidden">
          {/* Background Accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5E9]/60 via-transparent to-[#FFF8E1]/40 pointer-events-none" />

          <div className="relative p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7] flex items-center justify-center text-3xl shadow-sm">
                  {data.character || data.avatar || '🧑'}
                </div>
                {data.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#4CAF50] border-2 border-white rounded-full" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h2 className="text-[16px] font-bold text-[#1F2937]">{data.nickname}</h2>
                {data.bio && (
                  <p className="text-[12px] text-[#6B7280] mt-0.5 line-clamp-2 leading-relaxed">{data.bio}</p>
                )}
                {!data.bio && (
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5 italic">상태 메시지를 설정해보세요</p>
                )}

                {/* Visitor Counter - Cyworld vibes */}
                <div className="flex items-center gap-3 mt-2.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F0F7F4] rounded-full">
                    <span className="text-[10px] text-[#6B7280]">TODAY</span>
                    <span className="text-[11px] font-black text-[#145A46]">{Math.floor(Math.random() * 15) + 1}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF8E1] rounded-full">
                    <span className="text-[10px] text-[#6B7280]">TOTAL</span>
                    <span className="text-[11px] font-black text-[#F9A825]">{data.visitorCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BGM Bar - Cyworld homage */}
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-[#FAFAF8] rounded-xl border border-gray-50">
              <span className="text-sm">🎵</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#9CA3AF] truncate">
                  {data.bgmName ? data.bgmName : 'BGM을 설정해보세요'}
                </p>
              </div>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-2 bg-[#C8E6C9] rounded-full animate-pulse" />
                <div className="w-0.5 h-3 bg-[#A5D6A7] rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-0.5 h-2 bg-[#C8E6C9] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-0.5 h-3.5 bg-[#81C784] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-0.5 h-2 bg-[#C8E6C9] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Tab Navigation === */}
      <div className="sticky top-[45px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-0 py-2.5 flex flex-col items-center gap-0.5 transition-all relative ${
                  activeTab === tab.key
                    ? 'text-[#145A46]'
                    : 'text-[#9CA3AF] hover:text-[#6B7280]'
                }`}
              >
                <span className="text-[16px]">{tab.icon}</span>
                <span className={`text-[10px] font-semibold ${activeTab === tab.key ? 'text-[#145A46]' : ''}`}>
                  {tab.label}
                </span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-[#145A46] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === Tab Content === */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Today's Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-[#145A46]">오늘의 한마디</span>
                <span className="text-[10px] text-[#9CA3AF]">{todayDate}</span>
              </div>
              <p className="text-[13px] text-[#4B5563] leading-relaxed bg-[#F0F7F4] rounded-xl px-4 py-3">
                {data.bio || '아직 상태 메시지가 없어요 ✨'}
              </p>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <span className="text-xs font-bold text-[#145A46] block mb-3">프로필</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-[11px] text-[#9CA3AF]">닉네임</span>
                  <span className="text-[12px] font-semibold text-[#1F2937]">{data.nickname}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-[11px] text-[#9CA3AF]">상태</span>
                  <span className={`text-[12px] font-semibold ${data.isOnline ? 'text-[#4CAF50]' : 'text-[#9CA3AF]'}`}>
                    {data.isOnline ? '온라인' : '오프라인'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[11px] text-[#9CA3AF]">가입일</span>
                  <span className="text-[12px] font-semibold text-[#1F2937]">
                    {new Date(data.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Photos Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#145A46]">최근 사진</span>
                <button
                  onClick={() => setActiveTab('photos')}
                  className="text-[10px] text-[#9CA3AF] hover:text-[#145A46] transition-colors"
                >
                  더보기 →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['🏙️', '🌙', '🏖️'].map((icon, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-[#E8F5E9] to-[#FFF8E1] flex items-center justify-center text-2xl cursor-pointer hover:scale-[1.02] transition-transform">
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Guestbook Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#145A46]">최근 방명록</span>
                <button
                  onClick={() => setActiveTab('guestbook')}
                  className="text-[10px] text-[#9CA3AF] hover:text-[#145A46] transition-colors"
                >
                  더보기 →
                </button>
              </div>
              {minihome.guestbookEntries.length > 0 ? (
                <GuestbookList
                  entries={minihome.guestbookEntries.slice(0, 2).map((e) => ({
                    id: e.id,
                    authorNickname: e.authorNickname,
                    authorAvatar: e.authorAvatar,
                    content: e.content,
                    createdAt: e.createdAt,
                    isOwn: e.authorId === currentUser?.id,
                  }))}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-[11px] text-[#9CA3AF]">아직 방명록이 비어있어요 📝</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guestbook Tab */}
        {activeTab === 'guestbook' && (
          <div className="space-y-4">
            {!minihome.isOwnMinihome && (
              <GuestbookForm
                onSubmit={handleAddGuestbook}
                isLoading={isAddingGuestbook}
                maxLength={200}
              />
            )}

            <GuestbookList
              entries={minihome.guestbookEntries.map((e) => ({
                id: e.id,
                authorNickname: e.authorNickname,
                authorAvatar: e.authorAvatar,
                content: e.content,
                createdAt: e.createdAt,
                isOwn: e.authorId === currentUser?.id,
              }))}
              onDelete={minihome.isOwnMinihome ? handleDeleteGuestbook : undefined}
            />

            {minihome.guestbookEntries.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-2xl mb-2">📖</p>
                <p className="text-sm font-semibold text-[#1F2937] mb-1">방명록이 비어있어요</p>
                <p className="text-[11px] text-[#9CA3AF]">첫 번째 방명록을 남겨보세요!</p>
              </div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <MinihomePhotos />
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <MinihomePosts />
        )}

        {/* Friend Comments Tab */}
        {activeTab === 'friends' && (
          <MinihomeFriendComments />
        )}
      </main>
    </div>
  )
}
