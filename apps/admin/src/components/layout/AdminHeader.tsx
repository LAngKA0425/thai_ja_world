'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

const pageTitles: Record<string, string> = {
  '/dashboard': '대시보드',
  '/users': '유저 관리',
  '/reports': '신고 관리',
  '/broadcasts': '확성기 로그',
  '/notices': '공지 관리',
}

export function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path)) {
        return title
      }
    }
    return '관리자'
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-dark-sidebar border-b border-dark-border h-16 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-dark-text">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-dark-text">{user.nickname}</p>
                <p className="text-xs text-dark-text-secondary">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center text-white font-bold">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  )
}
