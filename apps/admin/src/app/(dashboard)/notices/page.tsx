'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { ko } from '@/lib/ko'

interface Notice {
  id: string
  title: string
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
  authorId?: string
}

export default function NoticesPage() {
  const router = useRouter()
  const token = getAdminToken()
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const mockNotices: Notice[] = [
    {
      id: '1',
      title: '2024년 3월 업데이트 안내',
      content: '새로운 기능이 추가되었습니다. 자세한 내용은 공지사항을 확인해주세요.',
      published: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: '긴급 점검 안내',
      content: '3월 10일 오전 2시부터 3시까지 서버 점검을 진행합니다.',
      published: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: '새로운 이벤트 시작',
      content: '이번 주부터 새로운 이벤트가 시작됩니다. 많은 참여 부탁드립니다.',
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setIsLoading(true)
        const response = await adminApiClient.get<any>('/api/admin/notices', { token })
        setNotices(response.notices || mockNotices)
      } catch (error) {
        console.error('Failed to load notices:', error)
        setNotices(mockNotices)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotices()
  }, [token])

  const handleDelete = (notice: Notice) => {
    confirm({
      title: '공지 삭제',
      message: '이 공지를 삭제하시겠습니까?',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await adminApiClient.delete(`/api/admin/notices/${notice.id}`, { token })
          setNotices((prev) => prev.filter((n) => n.id !== notice.id))
        } catch (error) {
          console.error('Failed to delete notice:', error)
        }
      },
      onCancel: () => {},
    })
  }

  const handleEdit = (notice: Notice) => {
    router.push(`/notices/${notice.id}/edit`)
  }

  const columns: Column<Notice>[] = [
    {
      key: 'title',
      label: ko.admin.title,
      width: '40%',
      render: (value) => (
        <span className="text-truncate block max-w-md" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'published',
      label: ko.admin.status,
      width: '15%',
      render: (value) => <StatusBadge status={value ? 'active' : 'pending'} />,
    },
    {
      key: 'createdAt',
      label: '작성일',
      width: '25%',
      render: (value) => formatDate(value),
    },
    {
      key: 'id',
      label: '작업',
      width: '20%',
      sortable: false,
      render: (_, row: Notice) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-accent-blue hover:text-blue-400 transition-colors"
            title="수정"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-accent-red hover:text-accent-red/80 transition-colors"
            title="삭제"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-text">{ko.admin.noticeManagement}</h1>
        <Button variant="primary" onClick={() => router.push('/notices/new')}>
          + {ko.admin.createNotice}
        </Button>
      </div>

      <Card>
        <DataTable<Notice>
          columns={columns}
          data={notices}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="공지가 없습니다"
        />
      </Card>

      <ConfirmDialog />
    </div>
  )
}
