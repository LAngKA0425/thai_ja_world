'use client'

import React, { useState } from 'react'
import { Card } from './Card'

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  onRowClick?: (row: T) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  onRowClick,
  isLoading = false,
  emptyMessage = '데이터가 없습니다',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">⌛</div>
          <p className="ml-2">로딩 중...</p>
        </div>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <p className="text-dark-text-secondary">{emptyMessage}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card noPadding>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border bg-dark-sidebar">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-4 text-left text-sm font-semibold text-dark-text cursor-pointer hover:bg-dark-card transition-colors"
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortKey === column.key && (
                      <span className="text-accent-blue">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={String(row[keyField])}
                className={`border-b border-dark-border transition-colors ${
                  onRowClick ? 'hover:bg-dark-sidebar cursor-pointer' : ''
                } ${idx % 2 === 0 ? 'bg-dark-card/50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 text-sm text-dark-text"
                    style={{ width: column.width }}
                  >
                    {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
