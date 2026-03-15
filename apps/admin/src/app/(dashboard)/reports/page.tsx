'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { ko } from '@/lib/ko'

interface Report {
  id: string
  reporterId: string
  reporterNickname: string
  reportedUserId: string
  reportedUserNickname: string
  reason: string
  description?: string
  createdAt: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
}

export default function ReportsPage() {
  const router = useRouter()
  const token = getAdminToken()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true)
        const response = await adminApiClient.get<any>('/api/admin/reports', { token })
        const reportList = response.reports || mockReports
        setReports(reportList)
      } catch (error) {
        console.error('Failed to load reports:', error)
        setReports(mockReports)
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [token])

  const mockReports: Report[] = [
    {
      id: '1',
      reporterId: 'user1',
      reporterNickname: '신고자1',
      reportedUserId: 'user2',
      reportedUserNickname: '피신고자1',
      reason: '욕설',
      description: '채팅에서 욕설 사용',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    },
    {
      id: '2',
      reporterId: 'user3',
      reporterNickname: '신고자2',
      reportedUserId: 'user4',
      reportedUserNickname: '피신고자2',
      reason: '스팸',
      description: '반복적인 스팸 메시지',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'reviewed',
    },
    {
      id: '3',
      reporterId: 'user5',
      reporterNickname: '신고자3',
      reportedUserId: 'user6',
      reportedUserNickname: '피신고자3',
      reason: '사기',
      description: '아이템 사기',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'resolved',
    },
  ]

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReports(reports)
    } else {
      setFilteredReports(reports.filter((r) => r.status === statusFilter))
    }
  }, [statusFilter, reports])

  const handleRowClick = (report: Report) => {
    router.push(`/reports/${report.id}`)
  }

  const columns: Column<Report>[] = [
    {
      key: 'reporterNickname',
      label: ko.admin.reporter,
      width: '18%',
    },
    {
      key: 'reportedUserNickname',
      label: ko.admin.reportedUser,
      width: '18%',
    },
    {
      key: 'reason',
      label: ko.admin.reason,
      width: '22%',
    },
    {
      key: 'status',
      label: ko.admin.status,
      width: '18%',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'createdAt',
      label: '신고일',
      width: '24%',
      render: (value) => formatDate(value),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-text">{ko.admin.reportManagement}</h1>
        <p className="text-dark-text-secondary">총 {reports.length}건</p>
      </div>

      <Card className="flex flex-col gap-6">
        <Select
          options={[
            { value: 'all', label: ko.admin.allStatus },
            { value: 'pending', label: ko.admin.pending },
            { value: 'reviewed', label: ko.admin.reviewed },
            { value: 'resolved', label: ko.admin.resolved },
            { value: 'dismissed', label: ko.admin.dismissed },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />

        <DataTable<Report>
          columns={columns}
          data={filteredReports}
          keyField="id"
          onRowClick={handleRowClick}
          isLoading={isLoading}
          emptyMessage="신고가 없습니다"
        />
      </Card>
    </div>
  )
}
