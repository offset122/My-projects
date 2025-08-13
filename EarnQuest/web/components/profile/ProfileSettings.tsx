'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth-context'
import { apiService } from '@/lib/api-service'
import { formatCurrency, validateEmail, validateKenyanPhone, getInitials } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  county: string
  occupation: string
}

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
  'Embu', 'Migori', 'Homa Bay', 'Naivasha', 'Voi', 'Kilifi', 'Lamu',
  'Mandera', 'Wajir', 'Marsabit', 'Isiolo', 'Moyale', 'Lodwar', 'Kapenguria',
  'Bungoma', 'Busia', 'Siaya', 'Kisii', 'Nyamira', 'Bomet', 'Narok',
  'Kajiado', 'Makueni', 'Kitui', 'Mwingi', 'Garsen', 'Maralal', 'Rumuruti',
  'Nanyuki', 'Murang\'a', 'Kerugoya', 'Kiambu', 'Limuru'
]

export default function ProfileSettings() {
  const { user, logout, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      county: '',
      occupation: '',
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.put('/auth/profile', data)
      if (response.success) {
        updateUser(response.data.user)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(response.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await apiService.delete('/auth/profile')
        if (response.success) {
          toast.success('Account deleted successfully')
          logout()
        } else {
          toast.error(response.error || 'Failed to delete account')
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again.')
      }
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user.first_name, user.last_name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.is_verified ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
              }`}>
                {user.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
              </span>
              <span className="text-sm text-gray-500">
                Member since {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(user.total_earnings)}
            </div>
            <div className="text-sm text-gray-600">Total Earned</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.surveys_completed}
            </div>
            <div className="text-sm text-gray-600">Surveys Completed</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(user.available_balance)}
            </div>
            <div className="text-sm text-gray-600">Available Balance</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                error={errors.first_name?.message}
                {...register('first_name', {
                  required: 'First name is required'
                })}
              />
              <Input
                label="Last Name"
                error={errors.last_name?.message}
                {...register('last_name', {
                  required: 'Last name is required'
                })}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                validate: (value) => validateEmail(value) || 'Invalid email format'
              })}
            />

            <Input
              label="Phone Number"
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Phone number is required',
                validate: (value) => validateKenyanPhone(value) || 'Invalid Kenyan phone number'
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  {...register('county')}
                >
                  <option value="">Select County</option>
                  {KENYAN_COUNTIES.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Occupation"
                {...register('occupation')}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Security</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600">Last updated: Never</p>
                </div>
                <Button size="sm" variant="outline">
                  Change Password
                </Button>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Phone Verification</h3>
                  <p className="text-sm text-gray-600">
                    {user.is_verified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
                {!user.is_verified && (
                  <Button size="sm" variant="outline">
                    Verify Phone
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Not enabled</p>
                </div>
                <Button size="sm" variant="outline">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">Download your account data</p>
                </div>
                <Button size="sm" variant="outline">
                  Export
                </Button>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-red-900">Delete Account</h3>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
