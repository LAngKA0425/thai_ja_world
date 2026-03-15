'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div
      className={`bg-dark-card border border-dark-border rounded-lg admin-shadow ${
        !noPadding ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
