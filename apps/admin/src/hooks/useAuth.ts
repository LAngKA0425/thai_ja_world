'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminUser, getAdminToken, verifyAdminAuth, logoutAdmin, AdminUser } from '@/lib/auth'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAdminToken()
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        return
      }

      const isValid = await verifyAdminAuth()
      if (isValid) {
        const currentUser = getAdminUser()
        setUser(currentUser)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        setUser(null)
        router.push('/')
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const logout = () => {
    logoutAdmin()
    setUser(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  }
}
