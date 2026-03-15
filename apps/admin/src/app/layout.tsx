import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '태자월드 관리자',
  description: '태자월드 관리자 대시보드',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
