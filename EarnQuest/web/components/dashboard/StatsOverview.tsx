'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiService } from '@/lib/api-service'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface StatsOverviewProps {
  onWithdraw: () => void
}

interface DashboardStats {
  total_earnings: number
  available_balance: number
  surveys_completed: number
  monthly_earnings: number
}

interface RecentReward {
  id: number
  amount: number
  type: string
  description: string
  created_at: string
}

export default function StatsOverview({ onWithdraw }: StatsOverviewProps) {
  const { user, updateUser } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRewards, setRecentRewards] = useState<RecentReward[]>([])
  const [availableSurveys, setAvailableSurveys] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load rewards dashboard
      const rewardsResponse = await apiService.get('/rewards/dashboard')
      if (rewardsResponse.success) {
        setStats(rewardsResponse.data.user_stats)
        setRecentRewards(rewardsResponse.data.recent_rewards.slice(0, 3))
        
        // Update user context
        updateUser({
          total_earnings: rewardsResponse.data.user_stats.total_earnings,
          available_balance: rewardsResponse.data.user_stats.available_balance,
          surveys_completed: rewardsResponse.data.user_stats.surveys_completed,
        })
      }

      // Load available surveys count
      const surveysResponse = await apiService.get('/surveys/available')
      if (surveysResponse.success) {
        setAvailableSurveys(surveysResponse.data.total_available)
      }

      // Try to claim daily bonus
      await claimDailyBonus()
      
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const claimDailyBonus = async () => {
    try {
      const response = await apiService.post('/rewards/bonus')
      if (response.success) {
        // Reload dashboard to reflect new balance
        setTimeout(() => loadDashboardData(), 1000)
      }
    } catch (error) {
      // Silently fail - user might have already claimed today
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'survey_completion':
        return '📋'
      case 'bonus':
        return '🎁'
      case 'referral':
        return '👥'
      default:
        return '💰'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-2xl font-bold mb-1">
            {formatCurrency(stats?.available_balance || 0)}
          </div>
          <div className="text-primary-100 text-sm">Available Balance</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats?.total_earnings || 0)}
          </div>
          <div className="text-gray-600 text-sm">Total Earned</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats?.surveys_completed || 0}
          </div>
          <div className="text-gray-600 text-sm">Surveys Completed</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats?.monthly_earnings || 0)}
          </div>
          <div className="text-gray-600 text-sm">This Month</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            className="flex items-center justify-center space-x-2 py-4"
            onClick={() => window.location.hash = 'surveys'}
          >
            <span className="text-xl">📋</span>
            <div className="text-left">
              <div className="font-medium">Take Surveys</div>
              <div className="text-xs opacity-75">{availableSurveys} available</div>
            </div>
          </Button>
          
          <Button
            variant="success"
            className="flex items-center justify-center space-x-2 py-4"
            onClick={onWithdraw}
          >
            <span className="text-xl">💳</span>
            <div className="text-left">
              <div className="font-medium">Withdraw</div>
              <div className="text-xs opacity-75">M-PESA & PayPal</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 py-4"
            onClick={() => window.location.hash = 'rewards'}
          >
            <span className="text-xl">🎁</span>
            <div className="text-left">
              <div className="font-medium">My Rewards</div>
              <div className="text-xs opacity-75">View history</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.hash = 'rewards'}
          >
            View All
          </Button>
        </div>
        
        {recentRewards.length > 0 ? (
          <div className="space-y-3">
            {recentRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getRewardIcon(reward.type)}</div>
                  <div>
                    <p className="font-medium text-gray-900">{reward.description}</p>
                    <p className="text-sm text-gray-500">{formatDateShort(reward.created_at)}</p>
                  </div>
                </div>
                <div className="text-success-600 font-bold">
                  +{formatCurrency(reward.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-gray-500 mb-2">No recent activity yet</p>
            <p className="text-sm text-gray-400">Complete your first survey to get started!</p>
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Earning Tips</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Complete your profile to get more targeted surveys</p>
          <p>• Check back daily for new survey opportunities</p>
          <p>• Refer friends to earn bonus rewards</p>
          <p>• Be honest in your responses for better survey matching</p>
        </div>
      </Card>
    </div>
  )
}
