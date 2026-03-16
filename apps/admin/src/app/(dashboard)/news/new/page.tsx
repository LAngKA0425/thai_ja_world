'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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

export default function NewsCreatePage() {
  const router = useRouter()
  const token = getAdminToken()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<ArticleForm>({
    title: '',
    summary: '',
    content: '',
    url: '',
    source_name: '',
    category: CATEGORIES[0],
    thumbnail_url: '',
  })

  const handleChange = (field: keyof ArticleForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('제목을 입력하세요')
      return
    }

    try {
      setIsSubmitting(true)
      await adminApiClient.post('/api/v1/admin/news', form, { token })
      router.push('/news')
    } catch (error) {
      console.error('Failed to create article:', error)
      alert('기사 생성 실패')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = 'w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200'

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark-text">{ko.admin.newsCreate}</h2>
        <Button variant="secondary" onClick={() => router.push('/news')}>
          {ko.common.back}
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.title}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="기사 제목"
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
                placeholder="출처명"
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
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">썸네일 URL</label>
            <input
              type="url"
              value={form.thumbnail_url}
              onChange={(e) => handleChange('thumbnail_url', e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.newsSummary}</label>
            <textarea
              value={form.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              placeholder="기사 요약 (2~3줄)"
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">{ko.admin.newsContent}</label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="기사 본문"
              rows={12}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '초안 저장'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => router.push('/news')}>
              {ko.common.cancel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
