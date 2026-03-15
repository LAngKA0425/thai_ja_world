'use client'

import { Card } from './Card'

interface StatCardProps {
  icon: string
  label: string
  value: number | string
  trend?: number
  color?: 'blue' | 'green' | 'red' | 'amber'
}

export function StatCard({ icon, label, value, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'text-accent-blue bg-accent-blue/10',
    green: 'text-accent-green bg-accent-green/10',
    red: 'text-accent-red bg-accent-red/10',
    amber: 'text-accent-amber bg-accent-amber/10',
  }

  return (
    <Card className="flex items-center gap-4">
      <div className={`${colorClasses[color]} w-16 h-16 rounded-lg flex items-center justify-center text-3xl`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-dark-text-secondary text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-dark-text mt-1">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-2 ${trend >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
    </Card>
  )
}
