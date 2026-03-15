'use client'

import { getStatusColor, getStatusLabel } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const color = getStatusColor(status)
  const label = getStatusLabel(status)

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {label}
    </span>
  )
}
