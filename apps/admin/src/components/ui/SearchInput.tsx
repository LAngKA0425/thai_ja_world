'use client'

import React, { useState, useCallback } from 'react'
import { debounce } from '@/lib/utils'

interface SearchInputProps {
  placeholder?: string
  onSearch: (value: string) => void
  debounceMs?: number
}

export function SearchInput({
  placeholder = '검색...',
  onSearch,
  debounceMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState('')

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      onSearch(searchValue)
    }, debounceMs),
    [onSearch, debounceMs]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary">
        🔍
      </span>
    </div>
  )
}
