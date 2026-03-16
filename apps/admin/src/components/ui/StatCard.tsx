'use client'

import { Card } from './Card'

interface StatCardProps {
  label: string
  value: number | string
  trend?: number
  color?: 'blue' | 'green' | 'red' | 'amber'
}

export function StatCard({ label, value, trend, color = 'blue' }: StatCardProps) {
  const borderColor = {
    blue: 'border-accent-blue',
    green: 'border-accent-green',
    red: 'border-accent-red',
    amber: 'border-accent-amber',
  }

  const textColor = {
    blue: 'text-accent-blue',
    green: 'text-accent-green',
    red: 'text-accent-red',
    amber: 'text-accent-amber',
  }

  return (
    <Card className={`border-l-4 ${borderColor[color]}`}>
      <p className="text-dark-text-secondary text-sm font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${textColor[color]}`}>{value}</p>
      {trend !== undefined && (
        <p className={`text-xs mt-2 ${trend >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </p>
      )}
    </Card>
  )
}
