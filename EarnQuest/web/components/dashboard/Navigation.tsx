'use client'

import { useAuth } from '@/lib/auth-context'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onWithdraw: () => void
}

export default function Navigation({ activeTab, onTabChange, onWithdraw }: NavigationProps) {
  const { user, logout } = useAuth()

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'surveys', label: 'Surveys', icon: '📋' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">💰</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EarnQuest</h1>
            <p className="text-sm text-gray-500">Made for Kenya</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(user?.available_balance || 0)}
          </p>
        </div>
        
        <Button
          onClick={onWithdraw}
          variant="success"
          size="sm"
          className="w-full"
        >
          Withdraw
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}
