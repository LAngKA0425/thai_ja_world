'use client'

import React, { useState, useCallback } from 'react'
import { debounce } from '@/lib/utils'

export interface SearchTarget {
  key: string
  label: string
}

interface SearchInputProps {
  placeholder?: string
  onSearch: (value: string, targetKey?: string) => void
  debounceMs?: number
  targets?: SearchTarget[]
}

export function SearchInput({
  placeholder = '검색...',
  onSearch,
  debounceMs = 300,
  targets,
}: SearchInputProps) {
  const [value, setValue] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<string>(targets?.[0]?.key || '')

  const debouncedSearch = useCallback(
    debounce((searchValue: string, targetKey?: string) => {
      onSearch(searchValue, targetKey)
    }, debounceMs),
    [onSearch, debounceMs]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue, selectedTarget || undefined)
  }

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTarget = e.target.value
    setSelectedTarget(newTarget)
    if (value) {
      debouncedSearch(value, newTarget || undefined)
    }
  }

  return (
    <div className="flex gap-2">
      {targets && targets.length > 0 && (
        <select
          value={selectedTarget}
          onChange={handleTargetChange}
          className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200"
        >
          {targets.map((target) => (
            <option key={target.key} value={target.key}>
              {target.label}
            </option>
          ))}
        </select>
      )}
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  )
}
