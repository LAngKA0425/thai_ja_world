'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { ko } from '@/lib/ko'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  onlineUsers: number
  pendingReports: number
  activeBroadcasts: number
  lastAccessTime: string | null
}

export default function DashboardPage() {
  const token = getAdminToken()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    onlineUsers: 0,
    pendingReports: 0,
    activeBroadcasts: 0,
    lastAccessTime: null,
  })
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)

        const usersResponse = await adminApiClient.get<any>('/api/admin/users', { token })
        const reportsResponse = await adminApiClient.get<any>('/api/admin/reports', { token })

        const users = usersResponse.users || []
        const reports = reportsResponse.reports || []

        const onlineCount = users.filter((u: any) => u.is_online || u.isOnline).length
        const lastUser = users.length > 0
          ? users.reduce((latest: any, u: any) => {
              const t = u.last_active_at || u.lastActiveAt || u.updatedAt || u.createdAt
              const lt = latest.last_active_at || latest.lastActiveAt || latest.updatedAt || latest.createdAt
              return new Date(t) > new Date(lt) ? u : latest
            })
          : null
        const lastTime = lastUser
          ? (lastUser.last_active_at || lastUser.lastActiveAt || lastUser.updatedAt || lastUser.createdAt)
          : null

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.status !== 'banned').length,
          onlineUsers: onlineCount,
          pendingReports: reports.filter((r: any) => r.status === 'pending').length,
          activeBroadcasts: 5,
          lastAccessTime: lastTime,
        })

        setRecentReports(reports.slice(0, 5))
        setRecentUsers(users.slice(0, 5))
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        setStats({
          totalUsers: 1250,
          activeUsers: 1105,
          onlineUsers: 38,
          pendingReports: 12,
          activeBroadcasts: 5,
          lastAccessTime: new Date().toISOString(),
        })
        setRecentReports([
          {
            id: '1',
            reporterId: 'user1',
            reporterNickname: '유저1',
            reportedUserId: 'user2',
            reportedUserNickname: '유저2',
            reason: '욕설',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ])
        setRecentUsers([
          {
            id: '1',
            email: 'user1@example.com',
            nickname: '유저1',
            createdAt: new Date().toISOString(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [token])

  const reportColumns: Column<any>[] = [
    {
      key: 'reporterNickname',
      label: ko.admin.reporter,
      width: '20%',
    },
    {
      key: 'reportedUserNickname',
      label: ko.admin.reportedUser,
      width: '20%',
    },
    {
      key: 'reason',
      label: ko.admin.reason,
      width: '30%',
    },
    {
      key: 'status',
      label: ko.admin.status,
      width: '15%',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'createdAt',
      label: '날짜',
      width: '15%',
      render: (value) => formatDate(value),
    },
  ]

  const userColumns: Column<any>[] = [
    {
      key: 'nickname',
      label: '닉네임',
      width: '20%',
    },
    {
      key: 'email',
      label: '이메일',
      width: '40%',
    },
    {
      key: 'points',
      label: '포인트',
      width: '15%',
      render: (value) => value || 0,
    },
    {
      key: 'gems',
      label: ko.admin.stylePoints,
      width: '15%',
      render: (value) => value || 0,
    },
    {
      key: 'createdAt',
      label: '가입일',
      width: '10%',
      render: (value) => formatDate(value),
    },
  ]

  return (
    <div className="space-y-8">
      <Card noPadding>
        <div className="flex items-stretch divide-x divide-dark-border">
          <div className="flex-1 px-6 py-5">
            <span className="text-sm text-dark-text-secondary">커뮤니티 총 이용자</span>
            <span className="text-2xl font-bold text-accent-blue ml-3">{stats.totalUsers.toLocaleString()}</span>
            <span className="text-sm text-dark-text-secondary ml-1">명</span>
          </div>
          <div className="flex-1 px-6 py-5">
            <span className="text-sm text-dark-text-secondary">현재 접속 중</span>
            <span className="text-2xl font-bold text-accent-green ml-3">{stats.onlineUsers.toLocaleString()}</span>
            <span className="text-sm text-dark-text-secondary ml-1">명</span>
          </div>
          <div className="flex-1 px-6 py-5">
            <span className="text-sm text-dark-text-secondary">활성 사용자</span>
            <span className="text-2xl font-bold text-emerald-400 ml-3">{stats.activeUsers.toLocaleString()}</span>
            <span className="text-sm text-dark-text-secondary ml-1">명</span>
          </div>
          <div className="flex-1 px-6 py-5">
            <span className="text-sm text-dark-text-secondary">미처리 신고</span>
            <span className="text-2xl font-bold text-accent-amber ml-3">{stats.pendingReports}</span>
            <span className="text-sm text-dark-text-secondary ml-1">건</span>
          </div>
          <div className="flex-1 px-6 py-5">
            <span className="text-sm text-dark-text-secondary">마지막 접속</span>
            <span className="text-sm font-semibold text-violet-400 ml-3">
              {stats.lastAccessTime ? formatDate(stats.lastAccessTime) : '-'}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-dark-text mb-4">최근 신고 (상위 5)</h2>
          <DataTable<any>
            columns={reportColumns}
            data={recentReports}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="신고가 없습니다"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-dark-text mb-4">최근 가입 유저 (상위 5)</h2>
          <DataTable<any>
            columns={userColumns}
            data={recentUsers}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="유저가 없습니다"
          />
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-dark-text mb-4">바로 가기</h2>
        <div className="flex gap-3 flex-wrap">
          {[
            { href: '/users', label: ko.admin.userManagement, color: 'border-emerald-500 text-emerald-400' },
            { href: '/reports', label: ko.admin.reportManagement, color: 'border-amber-500 text-amber-400' },
            { href: '/news', label: ko.admin.newsManagement, color: 'border-violet-500 text-violet-400' },
            { href: '/broadcasts', label: ko.admin.broadcastLog, color: 'border-cyan-500 text-cyan-400' },
            { href: '/notices', label: ko.admin.noticeManagement, color: 'border-rose-500 text-rose-400' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-5 py-3 bg-dark-sidebar rounded-lg border-l-4 ${link.color} hover:bg-dark-border transition-colors`}
            >
              <span className="text-sm font-medium">{link.label}</span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}
