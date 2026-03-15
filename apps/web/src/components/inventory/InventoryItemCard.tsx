'use client'

import { useState } from 'react'
import { InventoryItem } from '@/stores/inventory-store'

interface InventoryItemCardProps {
  item: InventoryItem
  isEquipped?: boolean
  onEquip?: (itemId: string) => Promise<void>
  onUnequip?: (itemId: string) => Promise<void>
}

export function InventoryItemCard({
  item,
  isEquipped = false,
  onEquip,
  onUnequip,
}: InventoryItemCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      top: '👕',
      bottom: '👖',
      shoes: '👟',
      accessory: '🎀',
      skin: '🎨',
      bgm: '🎵',
      effect: '✨',
      costume: '👔',
      background: '🖼️',
      furniture: '🪑',
      broadcast: '📢',
    }
    return icons[category] || '🎁'
  }

  const handleEquip = async () => {
    if (!onEquip) return
    try {
      setIsLoading(true)
      await onEquip(item.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnequip = async () => {
    if (!onUnequip) return
    try {
      setIsLoading(true)
      await onUnequip(item.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="cute-card p-4">
      <div className="text-center mb-3">
        <div className="text-4xl mb-2">{getCategoryIcon(item.category)}</div>
      </div>

      <h3 className="font-bold text-center text-sm mb-2 text-gray-800 truncate">
        {item.name}
      </h3>

      {item.quantity && item.quantity > 1 && (
        <p className="text-xs text-gray-600 text-center mb-2">
          수량: {item.quantity}
        </p>
      )}

      <div className="flex gap-2 mb-3 justify-center">
        <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700 font-bold">
          {{ top: '상의', bottom: '하의', shoes: '신발', accessory: '악세서리', skin: '스킨', bgm: 'BGM', effect: '이펙트', costume: '코스튬', background: '배경', furniture: '가구', broadcast: '확성기' }[item.category] || item.category}
        </span>
      </div>

      {isEquipped && (
        <div className="text-xs font-bold text-green-600 text-center mb-2">
          ✓ 장착 중
        </div>
      )}

      <button
        onClick={isEquipped ? handleUnequip : handleEquip}
        disabled={isLoading}
        className={`w-full py-2 text-sm font-bold rounded-2xl transition-all ${
          isEquipped
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'cute-button'
        } disabled:opacity-50`}
      >
        {isLoading ? '처리 중...' : isEquipped ? '장착 해제' : '장착하기'}
      </button>
    </div>
  )
}
