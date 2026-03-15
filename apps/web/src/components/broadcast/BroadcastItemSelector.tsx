'use client'

import { BroadcastItem } from '@/hooks/useBroadcast'

interface BroadcastItemSelectorProps {
  items: BroadcastItem[]
  selectedItemId?: string
  onSelect: (itemId: string | undefined) => void
}

export function BroadcastItemSelector({
  items,
  selectedItemId,
  onSelect,
}: BroadcastItemSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-gray-800 mb-3">확성기 선택 (선택사항)</h3>
      {items.length > 0 ? (
        <div className="space-y-2">
          <button
            onClick={() => onSelect(undefined)}
            className={`w-full p-3 rounded-2xl text-left transition-all ${
              !selectedItemId ? 'cute-button' : 'cute-card'
            }`}
          >
            <p className="font-bold">기본 확성기</p>
            <p className="text-xs text-gray-500">아이템 없이</p>
          </button>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full p-3 rounded-2xl text-left transition-all ${
                selectedItemId === item.id ? 'cute-button' : 'cute-card'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">📢 {item.name}</p>
                  <p className="text-xs text-gray-500">남은 개수: {item.quantity}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="cute-card p-3 text-center text-gray-500">
          사용 가능한 확성기가 없습니다
        </div>
      )}
    </div>
  )
}
