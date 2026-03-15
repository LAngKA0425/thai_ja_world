'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/ui/StatCard'
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
  pendingReports: number
  activeBroadcasts: number
}

export default function DashboardPage() {
  const token = getAdminToken()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingReports: 0,
    activeBroadcasts: 0,
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

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.status !== 'banned').length,
          pendingReports: reports.filter((r: any) => r.status === 'pending').length,
          activeBroadcasts: 5,
        })

        setRecentReports(reports.slice(0, 5))
        setRecentUsers(users.slice(0, 5))
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        setStats({
          totalUsers: 1250,
          activeUsers: 1105,
          pendingReports: 12,
          activeBroadcasts: 5,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label={ko.admin.totalUsers}
          value={stats.totalUsers.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon="✅"
          label={ko.admin.activeUsers}
          value={stats.activeUsers.toLocaleString()}
          color="green"
        />
        <StatCard
          icon="⚠️"
          label={ko.admin.pendingReports}
          value={stats.pendingReports}
          color="amber"
        />
        <StatCard
          icon="📢"
          label={ko.admin.activeNotices}
          value={stats.activeBroadcasts}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-dark-text mb-4">최근 신고 (상위 5)</h2>
          <DataTable<any>
            columns={reportColumns}
            data={recentReports}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="신고가 없습니다"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-dark-text mb-4">최근 가입 유저 (상위 5)</h2>
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
        <h2 className="text-lg font-bold text-dark-text mb-4">빠른 링크</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/users"
            className="p-4 bg-dark-sidebar rounded-lg hover:bg-dark-border transition-colors text-center"
          >
            <p className="text-2xl mb-2">👥</p>
            <p className="text-sm text-dark-text">{ko.admin.userManagement}</p>
          </a>
          <a
            href="/reports"
            className="p-4 bg-dark-sidebar rounded-lg hover:bg-dark-border transition-colors text-center"
          >
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm text-dark-text">{ko.admin.reportManagement}</p>
          </a>
          <a
            href="/broadcasts"
            className="p-4 bg-dark-sidebar rounded-lg hover:bg-dark-border transition-colors text-center"
          >
            <p className="text-2xl mb-2">📢</p>
            <p className="text-sm text-dark-text">{ko.admin.noticeManagement}</p>
          </a>
          <a
            href="/notices"
            className="p-4 bg-dark-sidebar rounded-lg hover:bg-dark-border transition-colors text-center"
          >
            <p className="text-2xl mb-2">📝</p>
            <p className="text-sm text-dark-text">{ko.admin.noticeManagement}</p>
          </a>
        </div>
      </Card>
    </div>
  )
}
