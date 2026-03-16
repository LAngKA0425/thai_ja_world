'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { ko } from '@/lib/ko'

interface Broadcast {
  id: string
  senderId: string
  senderNickname: string
  type: 'normal' | 'premium'
  message: string
  timestamp: string
  status: 'active' | 'archived'
  viewCount: number
}

export default function BroadcastsPage() {
  const token = getAdminToken()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [filteredBroadcasts, setFilteredBroadcasts] = useState<Broadcast[]>([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const mockBroadcasts: Broadcast[] = [
    {
      id: '1',
      senderId: 'user1',
      senderNickname: '유저1',
      type: 'normal',
      message: '안녕하세요! 오늘 날씨가 좋네요.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      viewCount: 234,
    },
    {
      id: '2',
      senderId: 'user2',
      senderNickname: '프리미엄유저',
      type: 'premium',
      message: '프리미엄 메시지입니다! 멋진 아이템 구경하세요~',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'active',
      viewCount: 1250,
    },
    {
      id: '3',
      senderId: 'user3',
      senderNickname: '유저3',
      type: 'normal',
      message: '누구 게임하실 분?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'archived',
      viewCount: 156,
    },
  ]

  useEffect(() => {
    const loadBroadcasts = async () => {
      try {
        setIsLoading(true)
        const response = await adminApiClient.get<any>('/api/admin/broadcasts', { token })
        setBroadcasts(response.broadcasts || mockBroadcasts)
      } catch (error) {
        console.error('Failed to load broadcasts:', error)
        setBroadcasts(mockBroadcasts)
      } finally {
        setIsLoading(false)
      }
    }

    loadBroadcasts()
  }, [token])

  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredBroadcasts(broadcasts)
    } else {
      setFilteredBroadcasts(broadcasts.filter((b) => b.type === typeFilter))
    }
  }, [typeFilter, broadcasts])

  const handleDelete = (broadcast: Broadcast) => {
    confirm({
      title: '공지 삭제',
      message: '이 공지를 삭제하시겠습니까?',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await adminApiClient.delete(`/api/admin/broadcasts/${broadcast.id}`, { token })
          setBroadcasts((prev) => prev.filter((b) => b.id !== broadcast.id))
        } catch (error) {
          console.error('Failed to delete broadcast:', error)
        }
      },
      onCancel: () => {},
    })
  }

  const columns: Column<Broadcast>[] = [
    {
      key: 'senderNickname',
      label: ko.admin.sender,
      width: '15%',
    },
    {
      key: 'type',
      label: ko.admin.type,
      width: '12%',
      render: (value) => (
        <span className={value === 'premium' ? 'text-accent-blue font-bold' : ''}>
          {value === 'premium' ? ko.admin.premium : ko.admin.normal}
        </span>
      ),
    },
    {
      key: 'message',
      label: '내용',
      width: '40%',
      render: (value: string) => (
        <span className="text-truncate block max-w-xs" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'viewCount',
      label: ko.admin.viewCount,
      width: '12%',
    },
    {
      key: 'timestamp',
      label: ko.admin.sentTime,
      width: '15%',
      render: (value) => formatDate(value),
    },
    {
      key: 'id',
      label: '작업',
      width: '6%',
      sortable: false,
      render: (_, row: Broadcast) => (
        <button
          onClick={() => handleDelete(row)}
          className="text-accent-red hover:text-accent-red/80 transition-colors"
          title="삭제"
        >
          삭제
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-text">{ko.admin.broadcastLog}</h1>
        <p className="text-dark-text-secondary">총 {broadcasts.length}건</p>
      </div>

      <Card className="flex flex-col gap-6">
        <Select
          options={[
            { value: 'all', label: '모든 유형' },
            { value: 'normal', label: ko.admin.normal },
            { value: 'premium', label: ko.admin.premium },
          ]}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        />

        <DataTable<Broadcast>
          columns={columns}
          data={filteredBroadcasts}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="공지가 없습니다"
        />
      </Card>

      <ConfirmDialog />
    </div>
  )
}
