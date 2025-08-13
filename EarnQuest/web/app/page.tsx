'use client'

import { useAuth } from '@/lib/auth-context'
import AuthPage from '@/components/auth/AuthPage'
import Dashboard from '@/components/dashboard/Dashboard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard />
}
