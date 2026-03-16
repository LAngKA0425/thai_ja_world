'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { ko } from '@/lib/ko'

interface ArticleForm {
  title: string
  summary: string
  content: string
  url: string
  source_name: string
  category: string
  thumbnail_url: string
}

interface ArticleData extends ArticleForm {
  id: string
  status: string
  created_at: string
  updated_at: string
  published_at: string | null
}

const CATEGORIES = [
  '태국 뉴스',
  '일본 뉴스',
  '한국 뉴스',
  '경제',
  '문화',
  '여행',
  '생활',
  '기타',
]

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending'],
  pending: ['approved', 'draft'],
  approved: ['published', 'pending'],
  published: ['draft'],
}

const STATUS_ACTION_LABELS: Record<string, string> = {
  pending: '승인 요청',
  approved: '승인',
  published: '발행',
  draft: '초안으로',
}

export default function NewsEditPage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.articleId as string
  const token = getAdminToken()
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ArticleForm>({
    title: '',
    summary: '',
    content: '',
    url: '',
    source_name: '',
    category: '',
    thumbnail_url: '',
  })

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setIsLoading(true)
        const data = await adminApiClient.get<ArticleData>(`/api/v1/admin/news/${articleId}`, { token })
        setArticle(data)
        setForm({
          title: data.title || '',
          summary: data.summary || '',
          content: data.content || '',
          url: data.url || '',
          source_name: data.source_name || '',
          category: data.category || '',
          thumbnail_url: data.thumbnail_url || '',
        })
      } catch (error) {
        console.error('Failed to load article:', error)
        alert('기사를 불러올 수 없습니다')
        router.push('/news')
      } finally {
        setIsLoading(false)
      }
    }

    if (articleId) loadArticle()
  }, [articleId, token])

  const handleChange = (field: keyof ArticleForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('제목을 입력하세요')
      return
    }

    try {
      setIsSaving(true)
      await adminApiClient.put(`/api/v1/admin/news/${articleId}`, form, { token })
      alert('저장 완료')
    } catch (error) {
      console.error('Failed to save article:', error)
      alert('저장 실패')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await adminApiClient.put(`/api/v1/admin/news/${articleId}/status`, { status: newStatus }, { token })
      const data = await adminApiClient.get<ArticleData>(`/api/v1/admin/news/${articleId}`, { token })
      setArticle(data)
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('상태 변경 실패')
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await adminApiClient.delete(`/api/v1/admin/news/${articleId}`, { token })
      router.push('/news')
    } catch (error) {
      console.error('Failed to delete article:', error)
      alert('삭제 실패')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2 text-dark-text-secondary">로딩 중...</p>
        </div>
      </Card>
    )
  }

  const availableTransitions = article ? (VALID_TRANSITIONS[article.status] || []) : []
  const inputClass = 'w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200'

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-dark-text">{ko.admin.newsEdit}</h2>
          {article && <StatusBadge status={article.status} />}
        </div>
        <Button variant="secondary" onClick={() => router.push('/news')}>
          {ko.common.back}
        </Button>
      </div>

      {availableTransitions.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-dark-text-secondary">상태 변경:</span>
            {availableTransitions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  status === 'approved' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                  status === 'published' ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30' :
                  status === 'pending' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                  'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                }`}
              >
                {STATUS_ACTION_LABELS[status] || status}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.title}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.newsSource}</label>
              <input
                type="text"
                value={form.source_name}
                onChange={(e) => handleChange('source_name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.newsCategory}</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.newsUrl}</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">썸네일 URL</label>
            <input
              type="url"
              value={form.thumbnail_url}
              onChange={(e) => handleChange('thumbnail_url', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.newsSummary}</label>
            <textarea
              value={form.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.newsContent}</label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={12}
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? '저장 중...' : ko.common.save}
              </Button>
              <Button variant="secondary" onClick={() => router.push('/news')}>
                {ko.common.cancel}
              </Button>
            </div>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
            >
              {ko.common.delete}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
