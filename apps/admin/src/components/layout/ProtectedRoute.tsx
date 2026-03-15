'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin text-3xl">⌛</div>
            <p className="text-dark-text">로딩 중...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card>
          <div className="flex flex-col items-center gap-4">
            <p className="text-dark-text">접근 권한이 없습니다</p>
            <p className="text-dark-text-secondary text-sm">관리자로 로그인해주세요</p>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
