'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'

const menuSections = [
  {
    title: '내 활동',
    items: [
      { icon: '📝', label: '내가 쓴 글', desc: '커뮤니티에 작성한 글 모아보기', href: '/community' },
      { icon: '💬', label: '내 댓글', desc: '내가 남긴 댓글 목록', href: '/community' },
      { icon: '🔔', label: '내 제보', desc: '내가 작성한 제보 모아보기', href: '/tips' },
      { icon: '❤️', label: '스크랩', desc: '저장한 글 모아보기', href: '/community' },
    ],
  },
  {
    title: '미니홈피',
    items: [
      { icon: '🏠', label: '내 미니홈피', desc: '미니홈피 방문하기', href: '__MINIHOME__' },
      { icon: '📖', label: '방명록', desc: '받은 방명록 확인', href: '__MINIHOME__' },
    ],
  },
  {
    title: '서비스',
    items: [
      { icon: '📢', label: '공지사항', desc: '운영 공지 확인', href: '/community' },
      { icon: '📧', label: '문의하기', desc: '운영팀에 문의', action: 'support' },
      { icon: '⚙️', label: '설정', desc: '계정 및 알림 설정', action: 'settings' },
    ],
  },
]

export default function MyPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout()
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-safe-top">
        <div className="max-w-3xl mx-auto px-4 py-2.5">
          <h1 className="text-lg font-bold text-[#1F2937]">마이페이지</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Profile Card */}
        <section className="px-4 pt-4 pb-2 max-w-3xl mx-auto">
          {isAuthenticated && user ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#145A46] flex items-center justify-center text-white text-2xl font-bold">
                  {user.nickname?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-[16px] font-bold text-[#1F2937]">{user.nickname}</h2>
                  <p className="text-[12px] text-[#9CA3AF]">{user.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-[#145A46] font-bold rounded-full">태자 회원</span>
                  </div>
                </div>
                <Link href="/profile" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <p className="text-[14px] text-[#6B7280] mb-3">로그인하고 태자 서비스를 이용해보세요</p>
              <div className="flex items-center justify-center gap-2">
                <Link href="/login" className="px-5 py-2 bg-[#145A46] text-white text-[13px] font-bold rounded-full">로그인</Link>
                <Link href="/signup" className="px-5 py-2 border border-[#145A46] text-[#145A46] text-[13px] font-bold rounded-full">회원가입</Link>
              </div>
            </div>
          )}
        </section>

        {/* 내 미니홈피 진입 카드 */}
        {isAuthenticated && user && (
          <section className="px-4 pt-2 pb-1 max-w-3xl mx-auto">
            <Link href={`/minihome/${user.id}`}>
              <div className="relative overflow-hidden bg-gradient-to-r from-[#E8F5E9] via-[#FFF8E1] to-[#E8F5E9] rounded-2xl border border-[#C8E6C9] p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm">
                    🏡
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#2E7D32]">내 미니홈피</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">나만의 공간을 꾸미고 친구들과 소통해보세요</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                    <span>방문하기</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
                {/* 감성 장식 요소 */}
                <div className="absolute top-1 right-12 text-[10px] opacity-30">✨</div>
                <div className="absolute bottom-1 right-6 text-[8px] opacity-20">🌿</div>
              </div>
            </Link>
          </section>
        )}

        {/* Quick Stats */}
        {isAuthenticated && (
          <section className="px-4 py-3 max-w-3xl mx-auto">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '작성글', value: '12' },
                { label: '댓글', value: '34' },
                { label: '스크랩', value: '8' },
                { label: '제보', value: '5' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-[16px] font-black text-[#145A46]">{s.value}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="h-2 bg-gray-50"></div>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <section key={section.title} className="px-4 py-4 max-w-3xl mx-auto">
            <h3 className="text-[13px] font-bold text-[#6B7280] mb-2 px-1">{section.title}</h3>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {section.items.map((item, idx) => {
                const inner = (
                  <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-xl w-8 text-center">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1F2937]">{item.label}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{item.desc}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                )

                const border = idx !== section.items.length - 1 ? 'border-b border-gray-50' : ''

                if (item.href) {
                  const resolvedHref = item.href === '__MINIHOME__'
                    ? (user ? `/minihome/${user.id}` : '/login')
                    : item.href
                  return (
                    <Link key={item.label} href={resolvedHref} className={`block ${border}`}>
                      {inner}
                    </Link>
                  )
                }
                return (
                  <button
                    key={item.label}
                    className={`w-full text-left ${border}`}
                    onClick={() => {
                      if (item.action === 'support') alert('운영팀 문의: taeja.help@gmail.com')
                      if (item.action === 'settings') alert('설정 페이지 준비 중입니다')
                    }}
                  >
                    {inner}
                  </button>
                )
              })}
            </div>
          </section>
        ))}

        {/* Logout */}
        {isAuthenticated && (
          <section className="px-4 pb-4 max-w-3xl mx-auto">
            <button onClick={handleLogout} className="w-full bg-white rounded-xl border border-gray-100 px-4 py-3.5 text-center text-[13px] text-[#9CA3AF] font-medium hover:bg-gray-50 transition-colors">
              로그아웃
            </button>
          </section>
        )}

        {/* Footer */}
        <footer className="px-4 py-6 max-w-3xl mx-auto text-center">
          <span className="text-[12px] font-bold text-[#1F2937]">
            <span className="text-[#145A46] font-black">태</span>국에{' '}
            <span className="text-[#145A46] font-black">살</span>자
          </span>
          <p className="text-[10px] text-[#D1D5DB] mt-1">v1.0.0 · © 2026 태국에 살자</p>
        </footer>
      </main>

      <HomeBottomNav />
    </div>
  )
}
