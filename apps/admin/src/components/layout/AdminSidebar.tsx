'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ko } from '@/lib/ko'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: ko.admin.dashboard, icon: '📊' },
  { href: '/users', label: ko.admin.userManagement, icon: '👥' },
  { href: '/reports', label: ko.admin.reportManagement, icon: '📋' },
  { href: '/broadcasts', label: ko.admin.broadcastLog, icon: '📢' },
  { href: '/notices', label: ko.admin.noticeManagement, icon: '📝' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-dark-sidebar border-r border-dark-border transition-all duration-300 fixed left-0 top-0 h-screen overflow-y-auto`}
    >
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <div className={`font-bold text-accent-blue transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          태자월드 관리자
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-dark-text-secondary hover:text-dark-text transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-blue text-white font-medium'
                    : 'text-dark-text-secondary hover:bg-dark-card'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-border bg-dark-card/50">
        <p className={`text-xs text-dark-text-secondary text-center transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          © 2024 태자월드
        </p>
      </div>
    </aside>
  )
}
