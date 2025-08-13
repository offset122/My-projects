'use client'

import { useEffect, useState } from 'react'
import { apiService } from '@/lib/api-service'
import { formatCurrency, formatDate } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Reward {
  id: number
  amount: number
  type: string
  description: string
  status: string
  created_at: string
  approved_at?: string
}

interface RewardStats {
  total_earnings: number
  available_balance: number
  pending_rewards: number
  surveys_completed: number
}

export default function RewardsList() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [stats, setStats] = useState<RewardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadRewards()
  }, [currentPage])

  const loadRewards = async () => {
    try {
      const response = await apiService.get(`/rewards/history?page=${currentPage}&per_page=10`)
      if (response.success) {
        setRewards(response.data.rewards)
        setTotalPages(response.data.total_pages)
      }

      // Load dashboard stats
      const dashboardResponse = await apiService.get('/rewards/dashboard')
      if (dashboardResponse.success) {
        setStats(dashboardResponse.data.user_stats)
      }
    } catch (error) {
      console.error('Load rewards error:', error)
    } finally {
      setIsLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-700'
      case 'pending':
        return 'bg-warning-100 text-warning-700'
      case 'rejected':
        return 'bg-danger-100 text-danger-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅'
      case 'pending':
        return '⏳'
      case 'rejected':
        return '❌'
      default:
        return '❓'
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Rewards</h1>
        <p className="text-gray-600">Track your earnings and reward history</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center bg-gradient-to-br from-success-500 to-success-600 text-white">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(stats.available_balance)}
            </div>
            <div className="text-success-100 text-sm">Available Balance</div>
          </Card>

          <Card className="text-center">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(stats.total_earnings)}
            </div>
            <div className="text-gray-600 text-sm">Total Earned</div>
          </Card>

          <Card className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(stats.pending_rewards)}
            </div>
            <div className="text-gray-600 text-sm">Pending Rewards</div>
          </Card>

          <Card className="text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.surveys_completed}
            </div>
            <div className="text-gray-600 text-sm">Surveys Completed</div>
          </Card>
        </div>
      )}

      {/* Rewards History */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Reward History</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={loadRewards}
          >
            Refresh
          </Button>
        </div>

        {rewards.length > 0 ? (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getRewardIcon(reward.type)}</div>
                  <div>
                    <p className="font-medium text-gray-900">{reward.description}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-500">{formatDate(reward.created_at)}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                        <span className="mr-1">{getStatusIcon(reward.status)}</span>
                        {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${reward.status === 'approved' ? 'text-success-600' : 'text-gray-600'}`}>
                    +{formatCurrency(reward.amount)}
                  </div>
                  {reward.approved_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Approved {formatDate(reward.approved_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rewards Yet</h3>
            <p className="text-gray-600 mb-4">Complete surveys to start earning rewards!</p>
            <Button onClick={() => window.location.hash = 'surveys'}>
              Browse Surveys
            </Button>
          </div>
        )}
      </Card>

      {/* Earning Tips */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Maximize Your Earnings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-xl">📋</div>
              <div>
                <h3 className="font-medium text-gray-900">Complete More Surveys</h3>
                <p className="text-sm text-gray-600">Check daily for new survey opportunities</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-xl">👥</div>
              <div>
                <h3 className="font-medium text-gray-900">Refer Friends</h3>
                <p className="text-sm text-gray-600">Earn bonus rewards for successful referrals</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-xl">🎯</div>
              <div>
                <h3 className="font-medium text-gray-900">Quality Responses</h3>
                <p className="text-sm text-gray-600">Honest answers lead to more survey invitations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-xl">📅</div>
              <div>
                <h3 className="font-medium text-gray-900">Daily Bonuses</h3>
                <p className="text-sm text-gray-600">Log in daily to claim bonus rewards</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
