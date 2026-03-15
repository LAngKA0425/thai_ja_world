'use client'

import { useState } from 'react'
import styles from './PlazaChatInput.module.css'

interface PlazaChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  maxLength?: number
}

export function PlazaChatInput({ onSend, isLoading, maxLength = 100 }: PlazaChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSend(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() && !isLoading) {
        onSend(message)
        setMessage('')
      }
    }
  }

  const characterCount = message.length
  const isFull = characterCount >= maxLength

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <textarea
          className={styles.input}
          placeholder="메시지를 입력하세요..."
          value={message}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              setMessage(e.target.value)
            }
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!message.trim() || isLoading}
          title="전송 (Enter)"
        >
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <>
              <span>📤</span>
            </>
          )}
        </button>
      </div>
      <div className={styles.footer}>
        <span className={`${styles.counter} ${isFull ? styles.full : ''}`}>
          {characterCount}/{maxLength}
        </span>
      </div>
    </form>
  )
}
