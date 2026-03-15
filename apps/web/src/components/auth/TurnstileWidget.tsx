'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

export default function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return
    if (widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        onVerify(token)
      },
      'error-callback': () => {
        onError?.()
      },
      'expired-callback': () => {
        onExpire?.()
      },
      theme: 'light',
      language: 'ko',
    })
  }, [siteKey, onVerify, onError, onExpire])

  useEffect(() => {
    if (!siteKey || siteKey === '' || siteKey === 'dev-skip') {
      // Dev mode: auto-verify
      onVerify('dev-turnstile-token')
      return
    }

    // Load Turnstile script if not already loaded
    if (!scriptLoadedRef.current && !document.querySelector('script[src*="turnstile"]')) {
      scriptLoadedRef.current = true
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
      script.async = true
      script.defer = true

      window.onTurnstileLoad = () => {
        renderWidget()
      }

      document.head.appendChild(script)
    } else if (window.turnstile) {
      renderWidget()
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // ignore cleanup errors
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey, onVerify, renderWidget])

  // Dev mode: Turnstile 미설정 시 안내
  if (!siteKey || siteKey === '' || siteKey === 'dev-skip') {
    return (
      <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-xs text-gray-500">
        [Dev] CAPTCHA 비활성 (NEXT_PUBLIC_TURNSTILE_SITE_KEY 미설정)
      </div>
    )
  }

  return <div ref={containerRef} className="flex justify-center" />
}
