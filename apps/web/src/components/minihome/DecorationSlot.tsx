'use client'

import { useState } from 'react'
import styles from './DecorationSlot.module.css'

interface Item {
  id: string
  name: string
  icon?: string
}

interface DecorationSlotProps {
  slotId: number
  equippedItem?: Item
  availableItems: Item[]
  onSelect: (slotId: number, itemId: string | null) => void
  isLoading?: boolean
}

export function DecorationSlot({
  slotId,
  equippedItem,
  availableItems,
  onSelect,
  isLoading,
}: DecorationSlotProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleSelect = (itemId: string) => {
    onSelect(slotId, itemId)
    setShowPicker(false)
  }

  const handleRemove = () => {
    onSelect(slotId, null)
  }

  return (
    <div className={styles.slotContainer}>
      <div className={styles.slot}>
        {equippedItem ? (
          <>
            <div className={styles.equippedItem}>
              {equippedItem.icon || '📦'}
            </div>
            <div className={styles.itemName}>{equippedItem.name}</div>
            <button
              className={styles.removeButton}
              onClick={handleRemove}
              disabled={isLoading}
            >
              제거
            </button>
          </>
        ) : (
          <div className={styles.emptySlot}>빈 슬롯</div>
        )}
      </div>

      {!equippedItem && (
        <button
          className={styles.selectButton}
          onClick={() => setShowPicker(!showPicker)}
          disabled={isLoading || availableItems.length === 0}
        >
          아이템 선택
        </button>
      )}

      {showPicker && availableItems.length > 0 && (
        <div className={styles.pickerOverlay} onClick={() => setShowPicker(false)}>
          <div
            className={styles.picker}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className={styles.pickerTitle}>아이템 선택</h4>
            <div className={styles.itemGrid}>
              {availableItems.map((item) => (
                <button
                  key={item.id}
                  className={styles.itemOption}
                  onClick={() => handleSelect(item.id)}
                  disabled={isLoading}
                >
                  <div className={styles.itemIcon}>{item.icon || '📦'}</div>
                  <div className={styles.itemOptionName}>{item.name}</div>
                </button>
              ))}
            </div>
            <button
              className={styles.closePickerButton}
              onClick={() => setShowPicker(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
