'use client'

import { useEffect, useState } from 'react'
import { apiService } from '@/lib/api-service'
import { formatCurrency } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SurveyModal from './SurveyModal'

interface Survey {
  id: string
  title: string
  description: string
  reward: number
  estimated_time: number
  category: string
}

export default function SurveysList() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      const response = await apiService.get('/surveys/available')
      if (response.success) {
        setSurveys(response.data.surveys)
      }
    } catch (error) {
      console.error('Load surveys error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return '🛒'
      case 'finance':
        return '💳'
      case 'food & dining':
        return '🍽️'
      case 'technology':
        return '💻'
      case 'healthcare':
        return '🏥'
      default:
        return '📋'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return 'bg-pink-100 text-pink-700'
      case 'finance':
        return 'bg-blue-100 text-blue-700'
      case 'food & dining':
        return 'bg-orange-100 text-orange-700'
      case 'technology':
        return 'bg-purple-100 text-purple-700'
      case 'healthcare':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Surveys</h1>
        <p className="text-gray-600">
          {surveys.length} survey{surveys.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Surveys Grid */}
      {surveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(survey.category)}`}>
                  <span className="mr-1">{getCategoryIcon(survey.category)}</span>
                  {survey.category}
                </span>
                <div className="bg-success-100 text-success-700 px-2 py-1 rounded-full text-sm font-bold">
                  {formatCurrency(survey.reward)}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{survey.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{survey.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="mr-1">⏱️</span>
                  ~{survey.estimated_time} min
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedSurvey(survey)}
                >
                  Start Survey
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Surveys Available</h3>
          <p className="text-gray-600 mb-4">Check back later for new survey opportunities!</p>
          <Button onClick={loadSurveys}>Refresh</Button>
        </Card>
      )}

      {/* Survey Modal */}
      {selectedSurvey && (
        <SurveyModal
          survey={selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          onComplete={() => {
            setSelectedSurvey(null)
            loadSurveys()
          }}
        />
      )}
    </div>
  )
}
