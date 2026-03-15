'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2'

  const variantStyles = {
    primary: 'bg-accent-blue hover:bg-blue-600 text-white disabled:bg-gray-600',
    secondary: 'bg-dark-card hover:bg-dark-border text-dark-text border border-dark-border',
    danger: 'bg-accent-red hover:bg-red-600 text-white disabled:bg-gray-600',
    warning: 'bg-accent-amber hover:bg-amber-600 text-white disabled:bg-gray-600',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className || ''}`}
      {...props}
    >
      {isLoading ? <span className="animate-spin">⌛</span> : null}
      {children}
    </button>
  )
}
