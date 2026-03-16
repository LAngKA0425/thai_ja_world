'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SearchInput, SearchTarget } from '@/components/ui/SearchInput'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate, truncate } from '@/lib/utils'
import { filterByKoreanSearch } from '@/lib/korean-search'
import { ko } from '@/lib/ko'

interface NewsArticle {
  id: string
  title: string
  summary: string
  source_name: string
  category: string
  status: string
  author_admin_id: string
  created_at: string
  updated_at: string
  published_at: string | null
  url: string
}

const STATUS_FILTERS = [
  { value: '', label: '전체' },
  { value: 'draft', label: '초안' },
  { value: 'pending', label: '승인 대기' },
  { value: 'approved', label: '승인됨' },
  { value: 'published', label: '발행됨' },
]

const SEARCH_TARGETS: SearchTarget[] = [
  { key: 'all', label: '전체' },
  { key: 'title', label: '제목' },
  { key: 'source_name', label: '출처' },
  { key: 'category', label: '카테고리' },
]

export default function NewsListPage() {
  const router = useRouter()
  const token = getAdminToken()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTarget, setSearchTarget] = useState('all')

  const loadArticles = async () => {
    try {
      setIsLoading(true)
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const response = await adminApiClient.get<any>(`/api/v1/admin/news${params}`, { token })
      const data = response.articles || response || []
      setArticles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load articles:', error)
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [token, statusFilter])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles)
      return
    }

    const fields = searchTarget === 'all'
      ? ['title', 'source_name', 'category', 'summary']
      : [searchTarget]

    setFilteredArticles(filterByKoreanSearch(articles, searchQuery, fields))
  }, [articles, searchQuery, searchTarget])

  const handleSearch = (value: string, targetKey?: string) => {
    setSearchQuery(value)
    if (targetKey) setSearchTarget(targetKey)
  }

  const handleStatusChange = async (articleId: string, newStatus: string) => {
    try {
      await adminApiClient.put(`/api/v1/admin/news/${articleId}/status`, { status: newStatus }, { token })
      await loadArticles()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('상태 변경 실패')
    }
  }

  const columns: Column<NewsArticle>[] = [
    {
      key: 'title',
      label: ko.admin.title,
      width: '30%',
      render: (value) => truncate(value, 40),
    },
    {
      key: 'source_name',
      label: ko.admin.newsSource,
      width: '12%',
    },
    {
      key: 'category',
      label: ko.admin.newsCategory,
      width: '10%',
    },
    {
      key: 'status',
      label: ko.admin.newsStatus,
      width: '10%',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: '등록일',
      width: '13%',
      render: (value) => formatDate(value),
    },
    {
      key: 'id',
      label: '관리',
      width: '25%',
      sortable: false,
      render: (_value, row) => (
        <div className="flex gap-2 flex-wrap">
          {row.status === 'draft' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'pending') }}
              className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors"
            >
              승인 요청
            </button>
          )}
          {row.status === 'pending' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'approved') }}
                className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
              >
                승인
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'draft') }}
                className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded hover:bg-slate-500/30 transition-colors"
              >
                반려
              </button>
            </>
          )}
          {row.status === 'approved' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'published') }}
              className="px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded hover:bg-violet-500/30 transition-colors"
            >
              발행
            </button>
          )}
          {row.status === 'published' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'draft') }}
              className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded hover:bg-slate-500/30 transition-colors"
            >
              비공개
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/news/${row.id}/edit`) }}
            className="px-2 py-1 text-xs bg-dark-border text-dark-text-secondary rounded hover:bg-dark-sidebar transition-colors"
          >
            수정
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                statusFilter === filter.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-dark-card text-dark-text-secondary border border-dark-border hover:bg-dark-sidebar'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <Button onClick={() => router.push('/news/new')}>
          {ko.admin.newsCreate}
        </Button>
      </div>

      <SearchInput
        placeholder="제목, 출처, 카테고리 검색 (초성 가능)"
        onSearch={handleSearch}
        targets={SEARCH_TARGETS}
      />

      <DataTable<NewsArticle>
        columns={columns}
        data={filteredArticles}
        keyField="id"
        isLoading={isLoading}
        emptyMessage={ko.admin.newsNoArticles}
        onRowClick={(row) => router.push(`/news/${row.id}/edit`)}
      />
    </div>
  )
}
