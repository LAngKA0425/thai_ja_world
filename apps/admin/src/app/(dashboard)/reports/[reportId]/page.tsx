'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { adminApiClient } from '@/lib/api-client'
import { getAdminToken } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

interface ReportDetail {
  id: string
  reporterId: string
  reporterNickname: string
  reportedUserId: string
  reportedUserNickname: string
  reason: string
  description?: string
  evidence?: string
  createdAt: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  notes?: string
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const token = getAdminToken()
  const reportId = params.reportId as string

  const [report, setReport] = useState<ReportDetail | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState<'pending' | 'reviewed' | 'resolved' | 'dismissed'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { confirm, ConfirmDialog } = useConfirmDialog()

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true)
        const response = await adminApiClient.get<any>(`/api/admin/reports/${reportId}`, {
          token,
        })
        const reportData = response.report || mockReport
        setReport(reportData)
        setNewStatus(reportData.status)
        setAdminNotes(reportData.notes || '')
      } catch (error) {
        console.error('Failed to load report:', error)
        setReport(mockReport)
        setNewStatus('pending')
      } finally {
        setIsLoading(false)
      }
    }

    loadReport()
  }, [reportId, token])

  const mockReport: ReportDetail = {
    id: reportId,
    reporterId: 'user1',
    reporterNickname: '신고자',
    reportedUserId: 'user2',
    reportedUserNickname: '피신고자',
    reason: '욕설',
    description: '미니홈 게시판에서 욕설 사용',
    evidence: '2024-03-08 14:30:00 - 채팅 로그',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    notes: '',
  }

  const handleAction = (action: 'warn' | 'mute' | 'ban') => {
    const actionMessages: Record<string, { title: string; message: string }> = {
      warn: {
        title: '경고 부여',
        message: '피신고자에게 경고를 부여하시겠습니까?',
      },
      mute: {
        title: '뮤트 처리',
        message: '피신고자를 7일간 뮤트하시겠습니까?',
      },
      ban: {
        title: '계정 차단',
        message: '피신고자를 30일간 차단하시겠습니까?',
      },
    }

    const config = actionMessages[action]
    if (!config) return

    confirm({
      title: config.title,
      message: config.message,
      confirmLabel: '확인',
      cancelLabel: '취소',
      isDangerous: action === 'ban',
      onConfirm: async () => {
        setIsSaving(true)
        try {
          await adminApiClient.post(
            `/api/admin/reports/${reportId}/action`,
            { action },
            { token }
          )
          setReport((prev) => (prev ? { ...prev, status: 'resolved' } : null))
          setNewStatus('resolved')
        } catch (error) {
          console.error('Action failed:', error)
        } finally {
          setIsSaving(false)
        }
      },
      onCancel: () => {},
    })
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      await adminApiClient.put(
        `/api/admin/reports/${reportId}`,
        { status: newStatus, notes: adminNotes },
        { token }
      )
      setReport((prev) => (prev ? { ...prev, status: newStatus, notes: adminNotes } : null))
    } catch (error) {
      console.error('Failed to save report:', error)
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

  if (!report) {
    return (
      <Card>
        <p className="text-dark-text">신고를 찾을 수 없습니다</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-text">신고 상세</h1>
        <Button variant="secondary" onClick={() => router.push('/reports')}>
          ← 뒤로 가기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-dark-text mb-6">신고 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-dark-text-secondary">신고자</p>
                  <p className="text-lg font-semibold text-dark-text">{report.reporterNickname}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-text-secondary">피신고자</p>
                  <p className="text-lg font-semibold text-dark-text">{report.reportedUserNickname}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-dark-text-secondary">신고 사유</p>
                <p className="text-lg font-semibold text-dark-text">{report.reason}</p>
              </div>

              <div>
                <p className="text-sm text-dark-text-secondary">상세 설명</p>
                <p className="text-dark-text bg-dark-sidebar p-3 rounded-lg">
                  {report.description || '없음'}
                </p>
              </div>

              <div>
                <p className="text-sm text-dark-text-secondary">증거</p>
                <p className="text-dark-text bg-dark-sidebar p-3 rounded-lg">
                  {report.evidence || '없음'}
                </p>
              </div>

              <div>
                <p className="text-sm text-dark-text-secondary">신고 일시</p>
                <p className="text-dark-text">{formatDate(report.createdAt)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-dark-text mb-6">관리자 노트</h2>
            <div className="space-y-4">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="신고에 대한 관리자 노트를 작성하세요..."
                className="w-full px-4 py-3 bg-dark-sidebar border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200"
                rows={5}
              />
              <Button
                variant="primary"
                onClick={handleSaveNotes}
                disabled={isSaving}
                isLoading={isSaving}
              >
                노트 저장
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-dark-text mb-6">신고 상태</h2>
            <div className="space-y-4">
              <Select
                label="상태"
                options={[
                  { value: 'pending', label: '대기 중' },
                  { value: 'reviewed', label: '검토됨' },
                  { value: 'resolved', label: '해결됨' },
                  { value: 'dismissed', label: '기각됨' },
                ]}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
              />
              <StatusBadge status={newStatus} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-dark-text mb-6">처리 작업</h2>
            <div className="space-y-3">
              <Button
                variant="warning"
                className="w-full"
                onClick={() => handleAction('warn')}
                disabled={isSaving}
              >
                ⚠️ 경고 부여
              </Button>
              <Button
                variant="warning"
                className="w-full"
                onClick={() => handleAction('mute')}
                disabled={isSaving}
              >
                🔇 7일 뮤트
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handleAction('ban')}
                disabled={isSaving}
              >
                🚫 30일 차단
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setNewStatus('dismissed')
                  handleSaveNotes()
                }}
                disabled={isSaving}
              >
                기각
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog />
    </div>
  )
}
