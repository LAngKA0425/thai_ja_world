'use client'

import { useState } from 'react'
import styles from './GuestbookForm.module.css'

interface GuestbookFormProps {
  onSubmit: (content: string) => Promise<void>
  isLoading?: boolean
  maxLength?: number
}

export function GuestbookForm({
  onSubmit,
  isLoading,
  maxLength = 200,
}: GuestbookFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSubmit(content)
      setContent('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = content.length
  const isFull = characterCount >= maxLength

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.label}>방명록 남기기</div>
      <textarea
        className={styles.textarea}
        placeholder="이 공간에 따뜻한 인사를 남겨보세요..."
        value={content}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            setContent(e.target.value)
          }
        }}
        disabled={isSubmitting || isLoading}
        rows={4}
      />
      <div className={styles.footer}>
        <span className={`${styles.counter} ${isFull ? styles.full : ''}`}>
          {characterCount}/{maxLength}
        </span>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!content.trim() || isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner" />
              제출 중...
            </>
          ) : (
            '✍️ 방명록 쓰기'
          )}
        </button>
      </div>
    </form>
  )
}
