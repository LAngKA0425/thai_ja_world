import type { Metadata, Viewport } from 'next'
import { Providers } from '@/providers'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#145A46',
}

export const metadata: Metadata = {
  title: '태자월드 - 나만의 캐릭터 커뮤니티',
  description: '귀여운 SD 캐릭터와 함께 나만의 미니홈을 꾸미고 친구들과 소통하는 커뮤니티',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '태자월드',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-[#FAFAF8] overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
