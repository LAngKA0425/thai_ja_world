'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate, formatNumber } from '@/lib/utils'
import { ko } from '@/lib/ko'

interface User {
  id: string
  email: string
  nickname: string
  status?: string
  gems: number
  points: number
  createdAt: string
  updatedAt: string
  isAdmin?: boolean
}

export default function UsersPage() {
  const router = useRouter()
  const token = getAdminToken()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const response = await adminApiClient.get<any>('/api/admin/users', { token })
        const userList = response.users || []
        setUsers(userList)
        setFilteredUsers(userList)
      } catch (error) {
        console.error('Failed to load users:', error)
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'user1@example.com',
            nickname: '유저1',
            status: 'active',
            gems: 1000,
            points: 5000,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            isAdmin: false,
          },
          {
            id: '2',
            email: 'user2@example.com',
            nickname: '유저2',
            status: 'active',
            gems: 2000,
            points: 10000,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            isAdmin: false,
          },
          {
            id: '3',
            email: 'banned@example.com',
            nickname: '차단유저',
            status: 'banned',
            gems: 0,
            points: 0,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            isAdmin: false,
          },
        ]
        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [token])

  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => (u.status || 'active') === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, statusFilter, users])

  const handleRowClick = (user: User) => {
    router.push(`/users/${user.id}`)
  }

  const columns: Column<User>[] = [
    {
      key: 'nickname',
      label: '닉네임',
      width: '15%',
    },
    {
      key: 'email',
      label: '이메일',
      width: '25%',
    },
    {
      key: 'status',
      label: ko.admin.status,
      width: '15%',
      render: (value) => <StatusBadge status={value || 'active'} />,
    },
    {
      key: 'gems',
      label: ko.admin.stylePoints,
      width: '12%',
      render: (value) => formatNumber(value),
    },
    {
      key: 'points',
      label: '포인트',
      width: '12%',
      render: (value) => formatNumber(value),
    },
    {
      key: 'createdAt',
      label: '가입일',
      width: '21%',
      render: (value) => formatDate(value),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-text">{ko.admin.userManagement}</h1>
        <p className="text-dark-text-secondary">총 {users.length}명</p>
      </div>

      <Card className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchInput placeholder={ko.admin.searchPlaceholder} onSearch={setSearchQuery} />
          <Select
            options={[
              { value: 'all', label: ko.admin.allStatus },
              { value: 'active', label: ko.admin.active },
              { value: 'banned', label: ko.admin.banned },
              { value: 'muted', label: ko.admin.muted },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        <DataTable<User>
          columns={columns}
          data={filteredUsers}
          keyField="id"
          onRowClick={handleRowClick}
          isLoading={isLoading}
          emptyMessage={ko.admin.noMatchingUsers}
        />
      </Card>
    </div>
  )
}
