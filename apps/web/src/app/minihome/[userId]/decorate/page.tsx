'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DecorationSlot } from '@/components/minihome/DecorationSlot'
import { useMinihome } from '@/hooks/useMinihome'
import { useInventoryStore } from '@/stores/inventory-store'
import { t } from '@/lib/i18n'
import styles from './decorate.module.css'

interface PageProps {
  params: {
    userId: string
  }
}

export default function DecoratePage({ params }: PageProps) {
  const router = useRouter()
  const minihome = useMinihome(params.userId)
  const { items } = useInventoryStore()
  const [pendingChanges, setPendingChanges] = useState<Record<number, string | null>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Only accessible by minihome owner
  useEffect(() => {
    if (!minihome.isLoading && !minihome.isOwnMinihome) {
      alert(t('minihome.decorateOwnOnly'))
      router.back()
    }
  }, [minihome.isLoading, minihome.isOwnMinihome, router])

  const handleSlotSelect = (slotId: number, itemId: string | null) => {
    setPendingChanges((prev) => ({
      ...prev,
      [slotId]: itemId,
    }))
  }

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      alert(t('minihome.noChanges'))
      return
    }

    try {
      setIsSaving(true)
      const newDecorations = minihome.decorations.map((dec) => ({
        ...dec,
        itemId: pendingChanges[dec.slotId] !== undefined ? pendingChanges[dec.slotId] : dec.itemId,
      }))

      await minihome.saveDecorations(newDecorations)
      setPendingChanges({})
      alert(t('minihome.decorationsSaved'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('minihome.decorationsSaveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setPendingChanges({})
  }

  // Get decoration items from inventory
  const decorationItems = items
    .filter((item) => item.category === 'decoration')
    .map((item) => ({
      id: item.shopItemId,
      name: item.name,
      icon: '📦',
    }))

  if (minihome.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className="loading-spinner" />
          <p>{t('minihome.decorateLoading')}</p>
        </div>
      </div>
    )
  }

  if (!minihome.isOwnMinihome) {
    return null
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← {t('common.back')}
      </button>

      <div className={styles.content}>
        <h1 className={styles.title}>🎨 {t('minihome.decorateTitle')}</h1>

        <div className={styles.instructionsBox}>
          <p>{t('minihome.decorateInstructions')}</p>
          <p className={styles.subtext}>{t('minihome.decorateSubtext')}</p>
        </div>

        <div className={styles.slotsGrid}>
          {[1, 2, 3, 4].map((slotId) => {
            const currentDecoration = minihome.decorations.find(
              (d) => d.slotId === slotId
            )
            const equippedItem = currentDecoration ? {
              id: currentDecoration.itemId,
              name: currentDecoration.itemName,
              icon: '📦',
            } : undefined

            return (
              <DecorationSlot
                key={slotId}
                slotId={slotId}
                equippedItem={equippedItem}
                availableItems={decorationItems}
                onSelect={handleSlotSelect}
                isLoading={isSaving}
              />
            )
          })}
        </div>

        {decorationItems.length === 0 && (
          <div className={styles.noItems}>
            <p>{t('minihome.noDecorationItems')}</p>
            <p className={styles.noItemsSubtext}>
              {t('minihome.buyDecorationItems')}
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving || Object.keys(pendingChanges).length === 0}
          >
            {isSaving ? t('minihome.saving') : t('minihome.saveButton')}
          </button>
          <button
            className={styles.resetButton}
            onClick={handleReset}
            disabled={Object.keys(pendingChanges).length === 0}
          >
            {t('minihome.reset')}
          </button>
        </div>
      </div>
    </div>
  )
}
