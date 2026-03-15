'use client'

import styles from './GuestbookList.module.css'

interface GuestbookEntry {
  id: string
  authorNickname: string
  authorAvatar?: string
  content: string
  createdAt: string
  isOwn?: boolean
}

interface GuestbookListProps {
  entries: GuestbookEntry[]
  isLoading?: boolean
  onDelete?: (entryId: string) => void
}

export function GuestbookList({
  entries,
  isLoading,
  onDelete,
}: GuestbookListProps) {
  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return '방금 전'
      if (diffMins < 60) return `${diffMins}분 전`
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 7) return `${diffDays}일 전`

      return d.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return date
    }
  }

  const getAvatarEmoji = (avatar?: string) => {
    return avatar || '🧑'
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className="loading-spinner" />
          <p>방명록 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>아직 방명록이 없습니다</p>
          <p className={styles.emptySubtext}>첫 번째 방명록을 남겨보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {entries.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.entryHeader}>
            <div className={styles.author}>
              <span className={styles.authorAvatar}>
                {getAvatarEmoji(entry.authorAvatar)}
              </span>
              <span className={styles.authorName}>{entry.authorNickname}</span>
            </div>
            <div className={styles.meta}>
              <span className={styles.date}>{formatDate(entry.createdAt)}</span>
              {entry.isOwn && onDelete && (
                <button
                  className={styles.deleteButton}
                  onClick={() => onDelete(entry.id)}
                  title="삭제"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className={styles.content}>{entry.content}</div>
        </div>
      ))}
    </div>
  )
}
