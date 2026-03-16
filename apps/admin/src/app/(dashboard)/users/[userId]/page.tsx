'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate, formatNumber } from '@/lib/utils'
import { ko } from '@/lib/ko'

interface UserDetail {
  id: string
  email: string
  nickname: string
  status: string
  gems: number
  points: number
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  reason: string
  timestamp: string
}

interface InventoryItem {
  id: string
  itemId: string
  itemName: string
  quantity: number
  acquiredAt: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const token = getAdminToken()
  const userId = params.userId as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { confirm, ConfirmDialog } = useConfirmDialog()

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)
        const response = await adminApiClient.get<any>(`/api/users/${userId}`, { token })
        setUser(response.user || mockUser)
      } catch (error) {
        console.error('Failed to load user:', error)
        setUser(mockUser)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [userId, token])

  const mockUser: UserDetail = {
    id: userId,
    email: 'user@example.com',
    nickname: '테스트유저',
    status: 'active',
    gems: 5000,
    points: 15000,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'purchase',
      amount: -1000,
      reason: '아이템 구매',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'reward',
      amount: 500,
      reason: '일일 로그인 보상',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      itemId: 'item_1',
      itemName: '파란색 모자',
      quantity: 1,
      acquiredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      itemId: 'item_2',
      itemName: '포켓볼',
      quantity: 3,
      acquiredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const handleAction = (action: string) => {
    const actionMessages: Record<string, { title: string; message: string }> = {
      warn: {
        title: ko.admin.giveWarning,
        message: '이 유저에게 경고를 부여하시겠습니까?',
      },
      mute: {
        title: '뮤트',
        message: '이 유저를 뮤트하시겠습니까? (7일)',
      },
      tempban: {
        title: '임시 차단',
        message: '이 유저를 임시 차단하시겠습니까? (30일)',
      },
      permban: {
        title: ko.admin.permanentBan,
        message: '이 유저를 영구 차단하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      },
    }

    const config = actionMessages[action]
    if (!config) return

    confirm({
      title: config.title,
      message: config.message,
      confirmLabel: '확인',
      cancelLabel: '취소',
      isDangerous: action === 'permban',
      onConfirm: async () => {
        setActionLoading(action)
        try {
          await adminApiClient.post(
            `/api/admin/users/${userId}/action`,
            { action },
            { token }
          )
          if (action === 'permban') {
            router.push('/users')
          } else {
            setUser((prev) => (prev ? { ...prev, status: action === 'permban' ? 'banned' : 'muted' } : null))
          }
        } catch (error) {
          console.error('Action failed:', error)
        } finally {
          setActionLoading(null)
        }
      },
      onCancel: () => {},
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-dark-text">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <p className="text-dark-text">유저를 찾을 수 없습니다</p>
      </Card>
    )
  }

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'type',
      label: ko.admin.type,
      width: '20%',
      render: (value) => (
        <span className={value === 'purchase' ? 'text-accent-red' : 'text-accent-green'}>
          {value === 'purchase' ? '지출' : '수익'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: '금액',
      width: '20%',
      render: (value) => (
        <span className={value < 0 ? 'text-accent-red' : 'text-accent-green'}>
          {value > 0 ? '+' : ''}{formatNumber(value)}
        </span>
      ),
    },
    {
      key: 'reason',
      label: ko.admin.reason,
      width: '40%',
    },
    {
      key: 'timestamp',
      label: '날짜',
      width: '20%',
      render: (value) => formatDate(value),
    },
  ]

  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'itemName',
      label: '아이템명',
      width: '50%',
    },
    {
      key: 'quantity',
      label: '수량',
      width: '25%',
    },
    {
      key: 'acquiredAt',
      label: '획득일',
      width: '25%',
      render: (value) => formatDate(value),
    },
  ]

  const common = ko.common

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-text">{user.nickname}</h1>
        <Button variant="secondary" onClick={() => router.push('/users')}>
          ← {common.back}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold text-dark-text mb-6">프로필 정보</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-dark-text-secondary">닉네임</p>
              <p className="text-lg font-semibold text-dark-text">{user.nickname}</p>
            </div>
            <div>
              <p className="text-sm text-dark-text-secondary">이메일</p>
              <p className="text-lg font-semibold text-dark-text">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-dark-text-secondary">상태</p>
              <StatusBadge status={user.status} />
            </div>
            <div>
              <p className="text-sm text-dark-text-secondary">{ko.admin.stylePoints}</p>
              <p className="text-lg font-semibold text-accent-blue">{formatNumber(user.gems)}</p>
            </div>
            <div>
              <p className="text-sm text-dark-text-secondary">포인트</p>
              <p className="text-lg font-semibold text-accent-green">{formatNumber(user.points)}</p>
            </div>
            <div>
              <p className="text-sm text-dark-text-secondary">가입일</p>
              <p className="text-dark-text">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-dark-text mb-6">관리 작업</h2>
          <div className="space-y-3">
            <Button
              variant="warning"
              className="w-full"
              onClick={() => handleAction('warn')}
              disabled={actionLoading !== null}
            >
              {ko.admin.giveWarning}
            </Button>
            <Button
              variant="warning"
              className="w-full"
              onClick={() => handleAction('mute')}
              disabled={actionLoading !== null}
            >
              {ko.admin.mute7days}
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => handleAction('tempban')}
              disabled={actionLoading !== null}
            >
              {ko.admin.tempBan30days}
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => handleAction('permban')}
              disabled={actionLoading !== null}
              isLoading={actionLoading === 'permban'}
            >
              {ko.admin.permanentBan}
            </Button>
            <div className="pt-4 border-t border-dark-border">
              <a
                href={`http://localhost:3000/minihome/${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="secondary" className="w-full">
                  {ko.admin.visitMinihome}
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-dark-text mb-4">{ko.admin.transactionHistory}</h2>
        <DataTable<Transaction>
          columns={transactionColumns}
          data={mockTransactions}
          keyField="id"
          emptyMessage="거래 내역이 없습니다"
        />
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-dark-text mb-4">{ko.admin.inventory}</h2>
        <DataTable<InventoryItem>
          columns={inventoryColumns}
          data={mockInventory}
          keyField="id"
          emptyMessage="아이템이 없습니다"
        />
      </Card>

      <ConfirmDialog />
    </div>
  )
}
