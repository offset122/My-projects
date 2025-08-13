'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth-context'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { validateEmail, validateKenyanPhone } from '@/lib/utils'

interface RegisterFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
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

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const { confirm_password, ...registrationData } = data
      await registerUser(registrationData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="First name"
          error={errors.first_name?.message}
          {...register('first_name', {
            required: 'First name is required'
          })}
        />
        <Input
          label="Last Name"
          placeholder="Last name"
          error={errors.last_name?.message}
          {...register('last_name', {
            required: 'Last name is required'
          })}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="your.email@example.com"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          validate: (value) => validateEmail(value) || 'Invalid email format'
        })}
      />

      <Input
        label="Phone Number"
        placeholder="0712345678 or +254712345678"
        error={errors.phone?.message}
        {...register('phone', {
          required: 'Phone number is required',
          validate: (value) => validateKenyanPhone(value) || 'Invalid Kenyan phone number'
        })}
      />

      <div className="grid grid-cols-2 gap-4">
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
          placeholder="Your occupation"
          {...register('occupation')}
        />
      </div>

      <Input
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        error={errors.confirm_password?.message}
        {...register('confirm_password', {
          required: 'Please confirm your password',
          validate: (value) => value === password || 'Passwords do not match'
        })}
      />

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
        size="lg"
      >
        Create Account
      </Button>
    </form>
  )
}
