'use client'

import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
  error?: string
}

export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-dark-text mb-2">{label}</label>}
      <select
        className={`w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200 ${
          error ? 'border-accent-red' : ''
        } ${className || ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-accent-red text-sm mt-1">{error}</p>}
    </div>
  )
}
