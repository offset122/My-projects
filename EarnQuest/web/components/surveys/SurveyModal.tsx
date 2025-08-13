'use client'

import { useState } from 'react'
import { apiService } from '@/lib/api-service'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Survey {
  id: string
  title: string
  description: string
  reward: number
  estimated_time: number
  category: string
}

interface SurveyModalProps {
  survey: Survey
  onClose: () => void
  onComplete: () => void
}

export default function SurveyModal({ survey, onClose, onComplete }: SurveyModalProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)

  const handleStartSurvey = async () => {
    setIsStarting(true)
    try {
      const response = await apiService.post(`/surveys/start/${survey.id}`)
      if (response.success) {
        setShowSurvey(true)
        toast.success('Survey started! Complete it to earn your reward.')
      } else {
        toast.error(response.error || 'Failed to start survey')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsStarting(false)
    }
  }

  const handleCompleteSurvey = async () => {
    try {
      const response = await apiService.post(`/surveys/complete/${survey.id}`)
      if (response.success) {
        toast.success(`Survey completed! You earned ${formatCurrency(response.data.reward.amount)}`)
        onComplete()
      }
    } catch (error) {
      console.error('Survey completion error:', error)
    }
  }

  if (showSurvey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Survey in Progress</h2>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="success"
                onClick={handleCompleteSurvey}
              >
                Complete Survey
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to exit? Your progress may not be saved.')) {
                    onClose()
                  }
                }}
              >
                Exit
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Survey Simulation</h3>
              <p className="text-gray-600 mb-6">
                In a real implementation, this would show the actual survey from CPX Research.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                For demo purposes, click "Complete Survey" above to simulate completion.
              </p>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="font-medium">{survey.title}</p>
                <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                <p className="text-sm font-medium text-success-600 mt-2">
                  Reward: {formatCurrency(survey.reward)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📋</span>
              <div>
                <span className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                  {survey.category}
                </span>
                <h2 className="text-xl font-bold text-gray-900">{survey.title}</h2>
              </div>
            </div>
            <div className="bg-success-100 text-success-700 px-3 py-1 rounded-full font-bold">
              {formatCurrency(survey.reward)}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6">{survey.description}</p>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Survey Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Time:</span>
                <span className="font-medium">~{survey.estimated_time} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reward:</span>
                <span className="font-medium text-success-600">{formatCurrency(survey.reward)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{survey.category}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Answer all questions honestly and completely</li>
              <li>• Do not refresh or close the survey page</li>
              <li>• Complete the survey in one session</li>
              <li>• Your responses are confidential and anonymous</li>
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-3">✅ Requirements</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Stable internet connection</li>
              <li>• {survey.estimated_time} minutes of uninterrupted time</li>
              <li>• Honest and thoughtful responses</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Rewards are credited after successful survey completion</li>
              <li>• Incomplete or low-quality responses may not be rewarded</li>
              <li>• Each survey can only be completed once per user</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleStartSurvey}
              loading={isStarting}
              className="flex-1"
              size="lg"
            >
              Start Survey
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By starting this survey, you agree to provide honest responses and 
            understand that rewards are subject to quality verification.
          </p>
        </div>
      </div>
    </div>
  )
}
