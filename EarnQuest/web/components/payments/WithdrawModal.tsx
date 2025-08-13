'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth-context'
import { apiService } from '@/lib/api-service'
import { formatCurrency, validateKenyanPhone, validateEmail } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface WithdrawModalProps {
  onClose: () => void
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  min_amount: number
  max_amount: number
  fee_percentage: number
  processing_time: string
}

interface WithdrawFormData {
  method: string
  amount: number
  phone_number?: string
  email?: string
}

export default function WithdrawModal({ onClose }: WithdrawModalProps) {
  const { user, updateUser } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<WithdrawFormData>()

  const watchedAmount = watch('amount')
  const watchedMethod = watch('method')

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  useEffect(() => {
    if (watchedMethod) {
      const method = paymentMethods.find(m => m.id === watchedMethod)
      setSelectedMethod(method || null)
    }
  }, [watchedMethod, paymentMethods])

  const loadPaymentMethods = async () => {
    try {
      const response = await apiService.get('/payments/methods')
      if (response.success) {
        setPaymentMethods(response.data.methods)
      }
    } catch (error) {
      console.error('Load payment methods error:', error)
      toast.error('Failed to load payment methods')
    } finally {
      setIsLoadingMethods(false)
    }
  }

  const calculateFee = (amount: number, method: PaymentMethod) => {
    return (amount * method.fee_percentage) / 100
  }

  const calculateTotal = (amount: number, method: PaymentMethod) => {
    return amount - calculateFee(amount, method)
  }

  const onSubmit = async (data: WithdrawFormData) => {
    if (!selectedMethod) return

    setIsLoading(true)
    try {
      const response = await apiService.post('/payments/withdraw', {
        method: data.method,
        amount: data.amount,
        phone_number: data.phone_number,
        email: data.email,
      })

      if (response.success) {
        toast.success('Withdrawal request submitted successfully!')
        updateUser({
          available_balance: response.data.new_balance
        })
        onClose()
      } else {
        toast.error(response.error || 'Withdrawal failed')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const validateAmount = (amount: number) => {
    if (!selectedMethod) return 'Please select a payment method'
    if (amount < selectedMethod.min_amount) {
      return `Minimum amount is ${formatCurrency(selectedMethod.min_amount)}`
    }
    if (amount > selectedMethod.max_amount) {
      return `Maximum amount is ${formatCurrency(selectedMethod.max_amount)}`
    }
    if (amount > (user?.available_balance || 0)) {
      return 'Insufficient balance'
    }
    return true
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
              <p className="text-gray-600">
                Available Balance: {formatCurrency(user?.available_balance || 0)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {isLoadingMethods ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                        watchedMethod === method.id
                          ? 'border-primary-600 ring-2 ring-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        className="sr-only"
                        {...register('method', { required: 'Please select a payment method' })}
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">
                            {method.type === 'mpesa' ? '📱' : '💳'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {method.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {method.processing_time} • {method.fee_percentage}% fee
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(method.min_amount)} - {formatCurrency(method.max_amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.method && (
                  <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>
                )}
              </div>

              {/* Amount Input */}
              <Input
                label="Withdrawal Amount (KES)"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                error={errors.amount?.message}
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                  validate: validateAmount
                })}
              />

              {/* Payment Details */}
              {selectedMethod?.type === 'mpesa' && (
                <Input
                  label="M-PESA Phone Number"
                  placeholder="0712345678 or +254712345678"
                  error={errors.phone_number?.message}
                  {...register('phone_number', {
                    required: 'Phone number is required for M-PESA',
                    validate: (value) => validateKenyanPhone(value || '') || 'Invalid Kenyan phone number'
                  })}
                />
              )}

              {selectedMethod?.type === 'paypal' && (
                <Input
                  label="PayPal Email"
                  type="email"
                  placeholder="your.email@example.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required for PayPal',
                    validate: (value) => validateEmail(value || '') || 'Invalid email format'
                  })}
                />
              )}

              {/* Transaction Summary */}
              {selectedMethod && watchedAmount && watchedAmount > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Transaction Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Withdrawal Amount:</span>
                      <span className="font-medium">{formatCurrency(watchedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee ({selectedMethod.fee_percentage}%):</span>
                      <span className="font-medium">-{formatCurrency(calculateFee(watchedAmount, selectedMethod))}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">You'll Receive:</span>
                        <span className="font-bold text-success-600">
                          {formatCurrency(calculateTotal(watchedAmount, selectedMethod))}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Processing time: {selectedMethod.processing_time}
                    </div>
                  </div>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">📋 Important Notes</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Withdrawals are processed within the stated timeframe</li>
                  <li>• Ensure your payment details are correct to avoid delays</li>
                  <li>• Processing fees are deducted from the withdrawal amount</li>
                  <li>• You'll receive a confirmation email once processed</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!selectedMethod || !watchedAmount}
                  className="flex-1"
                  size="lg"
                >
                  Confirm Withdrawal
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
