'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'
import { HomeHeader } from '@/components/home/HomeHeader'
import { HeroSection } from '@/components/home/HeroSection'
import { QuickCategories } from '@/components/home/QuickCategories'
import { LatestPosts } from '@/components/home/LatestPosts'
import { PopularPosts } from '@/components/home/PopularPosts'
import { AnonymousTips } from '@/components/home/AnonymousTips'
import { RecommendedRestaurants } from '@/components/home/RecommendedRestaurants'
import { LivingInfoSection } from '@/components/home/LivingInfoSection'
import { MarketSection } from '@/components/home/MarketSection'
import { JobSection } from '@/components/home/JobSection'
import { RecentMembers } from '@/components/home/RecentMembers'
import { LocalPicksSection } from '@/components/home/LocalPicksSection'
import { HomeBottomNav } from '@/components/home/HomeBottomNav'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      <HomeHeader />

      <main className="flex-1 overflow-y-auto">
        {/* Hero + Briefing */}
        <HeroSection />

        {/* Quick Category Navigation */}
        <QuickCategories />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Latest Community Posts */}
        <LatestPosts />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Popular Posts */}
        <PopularPosts />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Anonymous Tips */}
        <AnonymousTips />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Recommended Restaurants */}
        <RecommendedRestaurants />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Local Picks - 태자 추천 로컬 */}
        <LocalPicksSection />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Living Information */}
        <LivingInfoSection />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Market */}
        <MarketSection />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Jobs */}
        <JobSection />

        {/* Divider */}
        <div className="h-2 bg-gray-50"></div>

        {/* Recent Members (Minihome supplement) */}
        <RecentMembers />

        {/* Footer */}
        <footer className="px-4 py-6 max-w-3xl mx-auto text-center">
          <div className="mb-3">
            <span className="text-sm font-bold text-[#1F2937]">
              <span className="text-[#145A46] font-black">태</span>국에{' '}
              <span className="text-[#145A46] font-black">살</span>자
            </span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
            태국 한인 생활 커뮤니티 플랫폼<br />
            © 2026 태국에 살자. All rights reserved.
          </p>
          {!isAuthenticated && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link href="/login" className="px-5 py-2 bg-[#145A46] text-white text-sm font-semibold rounded-full hover:bg-[#0D4435] transition-colors">
                로그인
              </Link>
              <Link href="/signup" className="px-5 py-2 border border-[#145A46] text-[#145A46] text-sm font-semibold rounded-full hover:bg-[#145A46]/5 transition-colors">
                회원가입
              </Link>
            </div>
          )}
        </footer>
      </main>

      <HomeBottomNav />
    </div>
  )
}
