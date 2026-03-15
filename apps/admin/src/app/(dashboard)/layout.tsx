'use client'

import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <AdminHeader />
          <main className="bg-dark-bg min-h-[calc(100vh-64px)]">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
