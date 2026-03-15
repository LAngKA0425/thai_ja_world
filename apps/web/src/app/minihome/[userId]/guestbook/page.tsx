'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { GuestbookForm } from '@/components/minihome/GuestbookForm'
import { GuestbookList } from '@/components/minihome/GuestbookList'
import { useMinihome } from '@/hooks/useMinihome'
import { t } from '@/lib/i18n'
import styles from './guestbook.module.css'

interface PageProps {
  params: {
    userId: string
  }
}

export default function GuestbookPage({ params }: PageProps) {
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  const minihome = useMinihome(params.userId)
  const [isAddingGuestbook, setIsAddingGuestbook] = useState(false)

  const handleAddGuestbook = async (content: string) => {
    try {
      setIsAddingGuestbook(true)
      await minihome.addGuestbookEntry(content)
      alert(t('minihome.guestbookAddSuccess'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('minihome.guestbookAddError'))
    } finally {
      setIsAddingGuestbook(false)
    }
  }

  const handleDeleteGuestbook = async (entryId: string) => {
    if (!confirm(t('minihome.guestbookDeleteConfirm'))) return

    try {
      await minihome.deleteGuestbookEntry(entryId)
      alert(t('minihome.guestbookDeleteSuccess'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('minihome.guestbookDeleteError'))
    }
  }

  if (minihome.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className="loading-spinner" />
          <p>{t('minihome.guestbookLoading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← {t('minihome.backToMinihome')} {minihome.minihomeData?.nickname}
      </button>

      <div className={styles.content}>
        <h1 className={styles.title}>✍️ {t('minihome.guestbookTab')}</h1>

        {!minihome.isOwnMinihome && (
          <GuestbookForm
            onSubmit={handleAddGuestbook}
            isLoading={isAddingGuestbook}
            maxLength={200}
          />
        )}

        <GuestbookList
          entries={minihome.guestbookEntries.map((e) => ({
            id: e.id,
            authorNickname: e.authorNickname,
            authorAvatar: e.authorAvatar,
            content: e.content,
            createdAt: e.createdAt,
            isOwn: e.authorId === currentUser?.id,
          }))}
          onDelete={minihome.isOwnMinihome ? handleDeleteGuestbook : undefined}
        />
      </div>
    </div>
  )
}
