'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-dark-text mb-2">{label}</label>}
      <input
        className={`w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all duration-200 ${
          error ? 'border-accent-red' : ''
        } ${className || ''}`}
        {...props}
      />
      {error && <p className="text-accent-red text-sm mt-1">{error}</p>}
    </div>
  )
}
