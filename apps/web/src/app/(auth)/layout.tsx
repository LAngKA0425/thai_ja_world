'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/plaza')
    }
  }, [isAuthenticated, router])

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#145A46] flex items-center justify-center">
              <span className="text-white font-black text-sm">태</span>
            </div>
            <h1 className="text-lg font-bold text-[#1F2937] tracking-tight">
              <span className="text-[#145A46] font-black text-xl">태</span>
              <span className="text-[#1F2937]">국에</span>
              {' '}
              <span className="text-[#145A46] font-black text-xl">살</span>
              <span className="text-[#1F2937]">자</span>
            </h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-[#9CA3AF] text-xs">
            <p>&copy; 2026 태국에 살자. All rights reserved.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
