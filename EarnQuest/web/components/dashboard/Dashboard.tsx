'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Navigation from './Navigation'
import StatsOverview from './StatsOverview'
import SurveysList from '../surveys/SurveysList'
import RewardsList from '../rewards/RewardsList'
import ProfileSettings from '../profile/ProfileSettings'
import WithdrawModal from '../payments/WithdrawModal'

type ActiveTab = 'home' | 'surveys' | 'rewards' | 'profile'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const { user } = useAuth()

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.first_name}! 👋
              </h1>
              <p className="text-primary-100">
                Ready to earn some money today?
              </p>
            </div>
            <StatsOverview onWithdraw={() => setShowWithdrawModal(true)} />
          </div>
        )
      case 'surveys':
        return <SurveysList />
      case 'rewards':
        return <RewardsList />
      case 'profile':
        return <ProfileSettings />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onWithdraw={() => setShowWithdrawModal(true)}
        />
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'surveys', label: 'Surveys', icon: '📋' },
            { id: 'rewards', label: 'Rewards', icon: '🎁' },
            { id: 'profile', label: 'Profile', icon: '👤' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-3 text-xs font-medium ${
                activeTab === tab.id
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal onClose={() => setShowWithdrawModal(false)} />
      )}
    </div>
  )
}
