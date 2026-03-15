'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'

interface Notice {
  id: string
  title: string
  content: string
  published: boolean
}

export default function EditNoticePage() {
  const params = useParams()
  const router = useRouter()
  const token = getAdminToken()
  const noticeId = params.noticeId as string

  const [_notice, setNotice] = useState<Notice | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadNotice = async () => {
      try {
        setIsLoading(true)
        const response = await adminApiClient.get<any>(`/api/admin/notices/${noticeId}`, {
          token,
        })
        const noticeData = response.notice || mockNotice
        setNotice(noticeData)
        setTitle(noticeData.title)
        setContent(noticeData.content)
        setPublished(noticeData.published)
      } catch (error) {
        console.error('Failed to load notice:', error)
        setNotice(mockNotice)
        setTitle(mockNotice.title)
        setContent(mockNotice.content)
        setPublished(mockNotice.published)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotice()
  }, [noticeId, token])

  const mockNotice: Notice = {
    id: noticeId,
    title: '테스트 공지',
    content: '테스트 내용입니다',
    published: true,
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    }

    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      await adminApiClient.put(
        `/api/admin/notices/${noticeId}`,
        {
          title,
          content,
          published,
        },
        { token }
      )

      router.push('/notices')
    } catch (error) {
      console.error('Failed to update notice:', error)
      setErrors({
        submit: error instanceof Error ? error.message : '공지 수정에 실패했습니다',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-dark-text">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-text">공지 수정</h1>
        <Button variant="secondary" onClick={() => router.push('/notices')}>
          ← 뒤로 가기
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <Card className="bg-accent-red/10 border-accent-red">
            <p className="text-accent-red">{errors.submit}</p>
          </Card>
        )}

        <Card>
          <div className="space-y-6">
            <Input
              label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지사항 내용을 입력하세요"
                className={`w-full px-4 py-3 bg-dark-sidebar border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200 ${
                  errors.content ? 'border-accent-red' : ''
                }`}
                rows={10}
              />
              {errors.content && (
                <p className="text-accent-red text-sm mt-1">{errors.content}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="published" className="text-dark-text font-medium cursor-pointer">
                발행됨
              </label>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-dark-sidebar p-4">
            <h3 className="font-bold text-dark-text mb-3">미리보기</h3>
            <div className="space-y-2">
              <p className="text-sm text-dark-text-secondary">제목</p>
              <p className="text-lg font-bold text-dark-text">{title}</p>
              <p className="text-sm text-dark-text-secondary mt-4">내용</p>
              <p className="text-dark-text text-sm whitespace-pre-wrap">{content}</p>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-dark-text-secondary mb-2">발행 상태</p>
              <p className="text-lg font-bold text-dark-text">
                {published ? '✅ 발행됨' : '📝 임시저장'}
              </p>
            </div>

            <div className="space-y-3 mt-auto">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSaving}
                disabled={!title.trim() || !content.trim()}
              >
                저장
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/notices')}
                disabled={isSaving}
              >
                취소
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}
