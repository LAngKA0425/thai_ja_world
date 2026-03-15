'use client'

interface BlockConfirmDialogProps {
  userName: string
  isBlocking: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function BlockConfirmDialog({
  userName,
  isBlocking,
  onConfirm,
  onCancel,
  isLoading = false,
}: BlockConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="cute-card max-w-sm w-full p-6 animate-bounce-cute">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {isBlocking ? '사용자 차단' : '차단 해제'}
        </h2>

        <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
          <p className="text-gray-700 mb-3">
            {isBlocking
              ? `${userName}님을 차단하시겠습니까?`
              : `${userName}님의 차단을 해제하시겠습니까?`}
          </p>

          {isBlocking && (
            <div className="space-y-2 text-sm text-gray-600">
              <p>차단하면 다음이 제한됩니다:</p>
              <ul className="list-disc list-inside">
                <li>친구 목록에서 제거</li>
                <li>메시지 수신 불가</li>
                <li>미니홈피 방문 불가</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl font-bold cute-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : isBlocking ? '차단하기' : '해제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
