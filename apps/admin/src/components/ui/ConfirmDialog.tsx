'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Card } from './Card'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => Promise<void> | void
  onCancel: () => void
  isDangerous?: boolean
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<(ConfirmDialogProps & { id: string }) | null>(null)

  const confirm = (props: ConfirmDialogProps) => {
    setDialog({ ...props, id: Date.now().toString() })
  }

  const ConfirmDialog = () => {
    if (!dialog) return null

    const handleConfirm = async () => {
      try {
        await dialog.onConfirm()
        setDialog(null)
      } catch (error) {
        console.error('Confirm dialog error:', error)
      }
    }

    const handleCancel = () => {
      dialog.onCancel()
      setDialog(null)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <h3 className="text-lg font-bold text-dark-text mb-2">{dialog.title}</h3>
          <p className="text-dark-text-secondary mb-6">{dialog.message}</p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              {dialog.cancelLabel || '취소'}
            </Button>
            <Button
              variant={dialog.isDangerous ? 'danger' : 'primary'}
              onClick={handleConfirm}
              className="flex-1"
            >
              {dialog.confirmLabel || '확인'}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return { confirm, ConfirmDialog }
}
